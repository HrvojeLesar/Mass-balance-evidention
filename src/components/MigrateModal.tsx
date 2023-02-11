import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import { Trans, useTranslation } from "react-i18next";
import React from "react";
import { DataGroupContext } from "../DataGroupProvider";
import {
    Alert,
    Grid,
    Modal,
    Title,
    Text,
    Divider,
    Button,
    Accordion,
    Table,
    Box,
} from "@mantine/core";

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
    dbNames: string[];
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
    const { t } = useTranslation();
    const value = useContext(DataGroupContext);
    const [status, setStatus] = useState<Status>({
        overall: newProgress(),
        progress: [
            {
                buyer: {
                    total: 0,
                    failed: 0,
                    skipped: 0,
                    migrated: 0,
                    totalToMigrate: 0,
                },
                cell: {
                    total: 0,
                    failed: 0,
                    skipped: 0,
                    migrated: 0,
                    totalToMigrate: 0,
                },
                culture: {
                    total: 0,
                    failed: 0,
                    skipped: 0,
                    migrated: 0,
                    totalToMigrate: 0,
                },
                cellCulturePair: {
                    total: 0,
                    failed: 0,
                    skipped: 0,
                    migrated: 0,
                    totalToMigrate: 0,
                },
                entry: {
                    total: 0,
                    failed: 0,
                    skipped: 0,
                    migrated: 0,
                    totalToMigrate: 0,
                },
                dataGroup: {
                    total: 0,
                    failed: 0,
                    skipped: 0,
                    migrated: 0,
                    totalToMigrate: 0,
                },
            },
            {
                buyer: {
                    total: 0,
                    failed: 0,
                    skipped: 0,
                    migrated: 0,
                    totalToMigrate: 0,
                },
                cell: {
                    total: 0,
                    failed: 0,
                    skipped: 0,
                    migrated: 0,
                    totalToMigrate: 0,
                },
                culture: {
                    total: 0,
                    failed: 0,
                    skipped: 0,
                    migrated: 0,
                    totalToMigrate: 0,
                },
                cellCulturePair: {
                    total: 0,
                    failed: 0,
                    skipped: 0,
                    migrated: 0,
                    totalToMigrate: 0,
                },
                entry: {
                    total: 0,
                    failed: 0,
                    skipped: 0,
                    migrated: 0,
                    totalToMigrate: 0,
                },
                dataGroup: {
                    total: 0,
                    failed: 0,
                    skipped: 0,
                    migrated: 0,
                    totalToMigrate: 0,
                },
            },
        ],
        dbNames: ["test", "test2"],
    });

    const [isStartDisabled, setIsStartDisabled] = useState(true);
    const [isImporting, setIsImporting] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const displayImport = useMemo(() => {
        return window.__TAURI__ !== undefined;
    }, []);

    const startImport = useCallback(() => {
        if (displayImport) {
            invoke("try_start_import")
                .then((response) => {
                    if (value.refetch) {
                        value.refetch();
                    }
                    console.log(response);
                })
                .catch((err) => {
                    console.log(err);
                });
            setIsImporting(true);
        }
    }, [displayImport, value]);

    useEffect(() => {
        if (show) {
            setIsFinished(false);
            // setStatus({
            //     overall: newProgress(),
            //     progress: [],
            //     dbNames: [],
            // });
            var timeout = setTimeout(() => {
                setIsStartDisabled(false);
            }, 2000);
        }
        return () => {
            clearTimeout(timeout);
        };
    }, [show]);

    useEffect(() => {
        if (displayImport) {
            var unlistenTaskChangeEvent = listen("task-change-event", (e) => {
                console.log("task change event");
                let event = e as TauriEvent<TaskPayload>;
                setStatus((s) => ({
                    ...s,
                    mainTask: event.payload.mainTask,
                    subtask: event.payload.subtask,
                }));
            });
            var unlistenMigrationProgressEvent = listen(
                "progress-event",
                (e) => {
                    console.log("progress event");
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
                }
            );
            var unlistenMigrationFinishedEvent = listen(
                "migration-finished-event",
                () => {
                    console.log("migration finished event");
                    setIsImporting(false);
                    setIsFinished(true);
                }
            );
            var unlistenStartNewProgressEvent = listen(
                "start-new-progress-event",
                (e) => {
                    console.log("start new progress event");
                    let event = e as TauriEvent<string>;
                    setStatus((s) => ({
                        ...s,
                        progress: [...s.progress, newMigrationProgress()],
                        dbNames: [...s.dbNames, event.payload],
                    }));
                }
            );
        }

        return () => {
            if (displayImport) {
                unlistenTaskChangeEvent.then((f) => f());
                unlistenMigrationProgressEvent.then((f) => f());
                unlistenMigrationFinishedEvent.then((f) => f());
                unlistenStartNewProgressEvent.then((f) => f());
            }
        };
    }, [displayImport]);

    return (
        <Modal
            opened={show}
            onClose={() => {
                if (!isImporting) {
                    setIsImporting(false);
                    setIsStartDisabled(true);
                    onHide();
                }
            }}
            centered
            closeOnClickOutside={!isImporting}
            closeOnEscape={!isImporting}
            title={<Title order={4}>{t("titles.migrationModalTitle")}</Title>}
        >
            {isFinished === false ? (
                isImporting === false ? (
                    <Grid>
                        <Grid.Col>
                            <Alert color="red">
                                <Text fw={500}>{t("migration.warning")}</Text>
                                <Divider size="sm" my="sm" variant="dotted" />
                                <Text fw={500}>
                                    {t("migration.startWarning")}
                                </Text>
                            </Alert>
                        </Grid.Col>
                        <Grid.Col>
                            <Button
                                color="red"
                                disabled={isStartDisabled || isImporting}
                                onClick={() => {
                                    startImport();
                                }}
                            >
                                {t("migration.start")}
                            </Button>
                        </Grid.Col>
                    </Grid>
                ) : (
                    <Grid>
                        <div>
                            <Trans
                                t={t}
                                i18nKey="migration.migratedDatabases"
                                values={{
                                    migrated: status.overall.migrated,
                                    totalToMigrate:
                                        status.overall.totalToMigrate,
                                }}
                            />
                        </div>
                        {status.mainTask && (
                            <div>
                                <Trans
                                    t={t}
                                    i18nKey="migration.mainTask"
                                    values={{
                                        mainTask: t(
                                            `mainTask.${status.mainTask}`
                                        ),
                                    }}
                                />
                            </div>
                        )}
                        {status.subtask && (
                            <div>
                                <Trans
                                    t={t}
                                    i18nKey="migration.subtask"
                                    values={{
                                        subtask: t(`subtask.${status.subtask}`),
                                    }}
                                />
                            </div>
                        )}
                        {status.mainTask !== undefined &&
                            status.progress.length > 0 &&
                            status.progress[status.progress.length - 1][
                                status.mainTask
                            ].totalToMigrate > 0 && (
                                <div>
                                    <Trans
                                        t={t}
                                        i18nKey="migration.status"
                                        values={{
                                            migrated:
                                                status.progress[
                                                    status.progress.length - 1
                                                ][status.mainTask].migrated,
                                            totalToMigrate:
                                                status.progress[
                                                    status.progress.length - 1
                                                ][status.mainTask]
                                                    .totalToMigrate,
                                        }}
                                    />
                                </div>
                            )}
                    </Grid>
                )
            ) : (
                <div>
                    <Alert color="green">
                        <Text fw={500}>{t("migration.migrationFinished")}</Text>
                    </Alert>
                    <Divider my="sm" />
                    <Accordion multiple>
                        {status.progress.map((prog, idx) => {
                            return (
                                <Accordion.Item
                                    value={idx.toString()}
                                    key={idx}
                                >
                                    <Accordion.Control>
                                        {status.dbNames[idx] ??
                                            "__NO_NAME_FOUND__"}
                                    </Accordion.Control>
                                    <Accordion.Panel>
                                        <Box
                                            sx={(t) => ({
                                                marginBottom: t.spacing.lg,
                                                overflow: "auto",
                                            })}
                                        >
                                            <Table
                                                highlightOnHover
                                                withBorder
                                                withColumnBorders
                                                striped
                                            >
                                                <thead>
                                                    <tr>
                                                        <th>
                                                            {t(
                                                                "migration.identifier"
                                                            )}
                                                        </th>
                                                        <th>
                                                            {t(
                                                                "migration.migrated"
                                                            )}
                                                        </th>
                                                        <th>
                                                            {t(
                                                                "migration.totalToMigrate"
                                                            )}
                                                        </th>
                                                        <th>
                                                            {t(
                                                                "migration.skipped"
                                                            )}
                                                        </th>
                                                        <th>
                                                            {t(
                                                                "migration.failed"
                                                            )}
                                                        </th>
                                                        <th>
                                                            {t(
                                                                "migration.total"
                                                            )}
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.entries(prog).map(
                                                        ([key, value], i) => {
                                                            if (
                                                                key ===
                                                                "dataGroup"
                                                            ) {
                                                                return (
                                                                    <React.Fragment
                                                                        key={i}
                                                                    ></React.Fragment>
                                                                );
                                                            }
                                                            return (
                                                                <tr key={i}>
                                                                    <td>
                                                                        {t(
                                                                            `${key}.name`
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            value.migrated
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            value.totalToMigrate
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            value.skipped
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            value.failed
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            value.total
                                                                        }
                                                                    </td>
                                                                </tr>
                                                            );
                                                        }
                                                    )}
                                                </tbody>
                                            </Table>
                                        </Box>
                                    </Accordion.Panel>
                                </Accordion.Item>
                            );
                        })}
                    </Accordion>
                </div>
            )}
        </Modal>
    );
}
