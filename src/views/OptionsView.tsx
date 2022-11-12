import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";
import { Stats } from "fs";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import DataGroupSelect from "../components/DataGroupSelect";
import DataGroupForm from "../components/forms/DataGroupForm";
import { DataGroupContext } from "../DataGroupProvider";

type TaskPayload = {
    main_task?: string;
    subtask?: string;
};

type Progress = {
    migrated: number;
    skipped: number;
    failed: number;
    total: number;
    total_to_migrate: number;
};

type ProgressMessagePayload = {
    update_on: string;
    progress: Progress;
};

type TauriEvent<T> = {
    event: "progress-event";
    id: number;
    payload: T;
    windowLabel?: unknown;
};

type Status = {
    main_task: string;
    subtask: string;
    overall: {
        migrated: number;
        total: number;
    };
    current: {
        migrated: number;
        total: number;
    };
};

export default function OptionsView() {
    const { t } = useTranslation();
    const value = useContext(DataGroupContext);

    const [status, setStatus] = useState<Status>({
        main_task: "",
        subtask: "",
        overall: { migrated: 0, total: 0 },
        current: { migrated: 0, total: 0 },
    });

    const editValue = useMemo(() => {
        return value.groups.find((group) => group.id === value.selectedGroup);
    }, [value]);

    const displayImport = useMemo(() => {
        return window.__TAURI__ !== undefined;
    }, []);

    const startImport = useCallback(() => {
        if (displayImport) {
            invoke("try_start_import").then((response) =>
                console.log(response)
            );
        }
    }, [displayImport]);

    useEffect(() => {
        if (displayImport) {
            var unlistenTaskChangeEvent = async () => {
                let unlistenHandle = await listen("task-change-event", (e) => {
                    let event = e as TauriEvent<TaskPayload>;
                    console.log(event);
                    setStatus((s) => ({
                        ...s,
                        main_task: event.payload.main_task ?? "",
                        subtask: event.payload.subtask ?? "",
                    }));
                });
                return unlistenHandle;
            };
            var unlistenMigrationProgressEvent = async () => {
                let unlistenHandle = await listen("progress-event", (e) => {
                    let event = e as TauriEvent<ProgressMessagePayload>;
                    console.log(event);
                    let payload = event.payload;
                    if (payload.update_on === "Overall") {
                        setStatus((s) => ({
                            ...s,
                            overall: {
                                migrated: payload.progress.migrated,
                                total: payload.progress.total_to_migrate,
                            },
                        }));
                    } else {
                        setStatus((s) => ({
                            ...s,
                            current: {
                                migrated: payload.progress.migrated,
                                total: payload.progress.total_to_migrate,
                            },
                        }));
                    }
                });
                return unlistenHandle;
            };
        }

        return () => {
            if (displayImport) {
                unlistenTaskChangeEvent();
                unlistenMigrationProgressEvent();
            }
        };
    }, [displayImport]);

    return (
        <Row className="my-4">
            {displayImport && (
                <Col md>
                    <Button
                        onClick={() => {
                            startImport();
                        }}
                    >
                        Hello world
                    </Button>
                    {`Status: ${status.main_task} / ${status.subtask}`}
                    <br />
                    {`Status: ${status.overall.migrated} / ${status.overall.total}`}
                    <br />
                    {`Status: ${status.current.migrated} / ${status.current.total}`}
                </Col>
            )}
            <Col md>
                <Card className="p-2 shadow mb-4">
                    <div className="h5 mb-1">
                        {t("titles.dataGroupSelect").toString()}
                    </div>
                    <div className="divider"></div>
                    <DataGroupSelect />
                </Card>
            </Col>
            <Col md>
                <Card className="p-2 shadow mb-4">
                    <div className="h5 mb-1">
                        {t("titles.newDataGroup").toString()}
                    </div>
                    <div className="divider"></div>
                    <DataGroupForm
                        onInsertSuccess={() => {
                            if (value.refetch) {
                                value.refetch();
                            }
                        }}
                    />
                </Card>
            </Col>
            <Col md>
                <Card className="p-2 shadow mb-4">
                    <div className="h5 mb-1">
                        {t("titles.editDataGroup").toString()}
                    </div>
                    <div className="divider"></div>
                    <DataGroupForm
                        edit={editValue}
                        onUpdateSuccess={() => {
                            if (value.refetch) {
                                value.refetch();
                            }
                        }}
                    />
                </Card>
            </Col>
        </Row>
    );
}
