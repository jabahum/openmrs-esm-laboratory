import React, { useMemo, useState } from "react";
import {
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
  InlineLoading,
  Tile,
  Pagination,
} from "@carbon/react";

import { useTranslation } from "react-i18next";
import { usePagination, useSession } from "@openmrs/esm-framework";
import styles from "./tests-ordered.scss";
import { usePatientQueuesList } from "./tests-ordered-list.resource";
import {
  formatWaitTime,
  getTagColor,
  trimVisitNumber,
} from "../utils/functions";

const TestsOrderedList: React.FC = () => {
  const { t } = useTranslation();
  const session = useSession();

  const {
    patientQueueEntries,
    isLoading,
    isError: error,
    mutate,
  } = usePatientQueuesList(
    session?.sessionLocation?.uuid,
    status,
    session.user.systemId
  );

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(10);
  const {
    goTo,
    results: paginatedQueueEntries,
    currentPage,
  } = usePagination(patientQueueEntries, currentPageSize);

  const tableHeaders = useMemo(
    () => [
      { id: 0, header: t("visitId", "Visit ID"), key: "visitId" },
      {
        id: 1,
        header: t("patientNumber", "Patient No."),
        key: "patientNumber",
      },
      { id: 2, header: t("names", "Name"), key: "patient" },
      { id: 3, header: t("age", "Age"), key: "age" },
      { id: 4, header: t("orderedFrom", "Ordered From"), key: "orderedFrom" },
      { id: 5, header: t("waitingTime", "Waiting Time"), key: "waitingTime" },
      {
        id: 6,
        header: t("testsOrdered", "Test(s) Ordered"),
        key: "testsOrdered",
      },
    ],
    [t]
  );

  const tableRows = useMemo(() => {
    console.log(
      "paginatedQueueEntries--->" +
        JSON.stringify(paginatedQueueEntries, null, 2)
    );
    return paginatedQueueEntries?.map((entry) => ({
      ...entry,
      id: entry.id,
      visitId: {
        content: <span>{trimVisitNumber(entry.visitNumber)}</span>,
      },
      patientNumber: {
        content: <span>{entry?.identifiers[0]?.display}</span>,
      },
      names: {
        content: <span>{entry?.name}</span>,
      },
      age: {
        content: <span>{entry?.patientAge}</span>,
      },
      orderedFrom: {
        content: <span>{entry?.locationFrom}</span>,
      },
      waitingTime: {
        content: (
          <Tag>
            <span
              className={styles.statusContainer}
              style={{ color: `${getTagColor(entry.waitTime)}` }}
            >
              {formatWaitTime(entry.waitTime, t)}
            </span>
          </Tag>
        ),
      },
      testsOrdered: "",
    }));
  }, [paginatedQueueEntries]);

  if (isLoading) {
    return <InlineLoading status="active" />;
  }

  return (
    <div className={styles.container}>
      <DataTable
        rows={tableRows}
        headers={tableHeaders}
        useZebraStyles
        overflowMenuOnHover={true}
      >
        {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
          <TableContainer className={styles.tableContainer}>
            <Table {...getTableProps()} className={styles.activePatientsTable}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows?.map((row) => {
                  return (
                    <React.Fragment key={row.id}>
                      <TableRow {...getRowProps({ row })}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell?.id}>
                            {cell.value?.content ?? cell?.value}
                          </TableCell>
                        ))}
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
            {rows.length === 0 ? (
              <div className={styles.tileContainer}>
                <Tile className={styles.tile}>
                  <div className={styles.tileContent}>
                    <p className={styles.content}>
                      {t("noPatientsToDisplay", "No patients to display")}
                    </p>
                  </div>
                </Tile>
              </div>
            ) : null}
            <Pagination
              forwardText="Next page"
              backwardText="Previous page"
              page={currentPage}
              pageSize={currentPageSize}
              pageSizes={pageSizes}
              totalItems={paginatedQueueEntries?.length}
              className={styles.pagination}
              onChange={({ pageSize, page }) => {
                if (pageSize !== currentPageSize) {
                  setPageSize(pageSize);
                }
                if (page !== currentPage) {
                  goTo(page);
                }
              }}
            />
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};

export default TestsOrderedList;
