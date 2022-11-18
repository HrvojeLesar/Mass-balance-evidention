import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Col, Modal, ProgressBar, Row } from "react-bootstrap";
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";

enum Task {
    FetchRemoteBuyer,
    FetchRemoteCell,
    FetchRemoteCulture,
    FetchRemoteCellCulturePair,
    FetchRemoteEntry,
    FetchLocalBuyer,
    FetchLocalCell,
    FetchLocalCulture,
    FetchLocalCellCulturePair,
    FetchLocalEntry,
    LoadToMigrateBuyer,
    LoadToMigrateCell,
    LoadToMigrateCulture,
    LoadToMigrateCellCulturePair,
    LoadToMigrateEntry,
    InsertBuyer,
    InsertCell,
    InsertCulture,
    InsertCellCulturePair,
    InsertEntry,
}

enum MainTask {
    Buyer = "buyer",
    Cell = "cell",
    Culture = "culture",
    CellCulturePair = "cellCulturePair",
    Entry = "entry",
    DataGroup = "dataGroup",
}

type TaskPayload = {
    mainTask?: MainTask;
    subtask?: Task;
};

type Progress = {
    migrated: number;
    skipped: number;
    failed: number;
    total: number;
    totalToMigrate: number;
};

enum UpdateOn {
    Overall = "overall",
    Other = "other",
}

type ProgressMessagePayload = {
    updateOn: UpdateOn;
    progress: Progress;
};

type TauriEvent<T> = {
    event: "progress-event";
    id: number;
    payload: T;
    windowLabel?: unknown;
};

type Status = {
    mainTask?: MainTask;
    subtask?: Task;
    overall: Progress;
    progress: MigrationProgress[];
};

type MigrationProgress = {
    buyer: Progress;
    cell: Progress;
    culture: Progress;
    cellCulturePair: Progress;
    entry: Progress;
    dataGroup: Progress;
};

type MigrateModal = {
    show: boolean;
    onHide: () => void;
};

const newProgress = (): Progress => ({
    total: 0,
    failed: 0,
    skipped: 0,
    migrated: 0,
    totalToMigrate: 0,
});

const newMigrationProgress = (): MigrationProgress => ({
    buyer: newProgress(),
    cell: newProgress(),
    culture: newProgress(),
    cellCulturePair: newProgress(),
    entry: newProgress(),
    dataGroup: newProgress(),
});

export default function EditModal({ show, onHide }: MigrateModal) {
    const [status, setStatus] = useState<Status>({
        overall: newProgress(),
        progress: [],
    });

    const [isStartDisabled, setIsStartDisabled] = useState(true);
    const [isImporting, setIsImporting] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const displayImport = useMemo(() => {
        return window.__TAURI__ !== undefined;
    }, []);

    const startImport = useCallback(() => {
        if (displayImport) {
            invoke("try_start_import").then((response) =>
                console.log(response)
            );
            setIsImporting(true);
        }
    }, [displayImport]);

    useEffect(() => {
        if (show) {
            setIsFinished(false);
            var timeout = setTimeout(() => {
                setIsStartDisabled(false);
            }, 2000);
        }
        return () => {
            console.log("cleartimeout");
            clearTimeout(timeout);
        };
    }, [show]);

    useEffect(() => {
        if (displayImport) {
            var unlistenTaskChangeEvent = async () => {
                let unlistenHandle = await listen("task-change-event", (e) => {
                    let event = e as TauriEvent<TaskPayload>;
                    setStatus((s) => ({
                        ...s,
                        mainTask: event.payload.mainTask,
                        subtask: event.payload.subtask,
                    }));
                });
                return unlistenHandle;
            };
            var unlistenMigrationProgressEvent = async () => {
                let unlistenHandle = await listen("progress-event", (e) => {
                    let event = e as TauriEvent<ProgressMessagePayload>;
                    let payload = event.payload;
                    if (payload.updateOn === UpdateOn.Overall) {
                        setStatus((s) => ({
                            ...s,
                            overall: payload.progress,
                        }));
                    } else {
                        setStatus((s) => {
                            if (s.mainTask && s.progress.length > 0) {
                                s.progress[s.progress.length - 1][s.mainTask] =
                                    payload.progress;
                            }
                            return { ...s };
                        });
                    }
                });
                return unlistenHandle;
            };
            var unlistenMigrationFinishedEvent = async () => {
                let unlistenHandle = await listen(
                    "migration-finished-event",
                    () => {
                        setIsImporting(false);
                        setIsFinished(true);
                    }
                );
                return unlistenHandle;
            };
            var unlistenStartNewProgressEvent = async () => {
                let unlistenHandle = await listen(
                    "start-new-progress-event",
                    () => {
                        setStatus((s) => ({
                            ...s,
                            progress: [...s.progress, newMigrationProgress()],
                        }));
                    }
                );
                return unlistenHandle;
            };
        }

        return () => {
            if (displayImport) {
                unlistenTaskChangeEvent();
                unlistenMigrationProgressEvent();
                unlistenMigrationFinishedEvent();
                unlistenStartNewProgressEvent();
            }
        };
    }, [displayImport]);

    return (
        <Modal
            show={show}
            onHide={() => {
                setIsImporting(false);
                setIsStartDisabled(true);
                onHide();
            }}
            centered
            backdrop="static"
            keyboard={!isImporting}
        >
            <Modal.Header closeButton={!isImporting}>
                <Modal.Title>
                    Import local database {isFinished.toString()}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {isImporting === false ? (
                    <Row>
                        <Alert variant="danger">
                            <p>
                                Počinje s unošenjem podataka iz lokalnih baza.
                                Proces može potrajati i nije moguće prekinuti
                                ili nastaviti. Moguće je da preneseni podatci
                                neće biti sasvim točni (npr. datum).
                            </p>
                            <hr />
                            <p className="mb-0">
                                Pritisnite tipku "Početak" za pokretanje
                                procesa.
                            </p>
                        </Alert>
                        <Button
                            disabled={isStartDisabled || isImporting}
                            onClick={() => {
                                startImport();
                            }}
                        >
                            Start
                        </Button>
                    </Row>
                ) : (
                    <Row>
                        <div>
                            Migrirano: <b>{status.overall.migrated}</b> /{" "}
                            <b>{status.overall.totalToMigrate}</b> baza.
                        </div>
                        <div>
                            Trenutno prebacuje: <b>{status.mainTask}</b>.
                        </div>
                        <div>
                            Podzadatak: <b>{status.subtask}</b>.
                        </div>
                        {status.mainTask !== undefined &&
                            status.progress.length > 0 && (
                                <div>
                                    Status:{" "}
                                    <b>
                                        {
                                            status.progress[
                                                status.progress.length - 1
                                            ][status.mainTask].migrated
                                        }
                                    </b>
                                    {" / "}
                                    <b>
                                        {
                                            status.progress[
                                                status.progress.length - 1
                                            ][status.mainTask].totalToMigrate
                                        }
                                    </b>
                                </div>
                            )}
                    </Row>
                )}
            </Modal.Body>
        </Modal>
    );
}
