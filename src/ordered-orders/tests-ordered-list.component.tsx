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
        header: t("patientNo", "Patient No."),
        key: "patientNo",
      },
      {
        id: 2,
        header: t("names", "Names"),
        key: "names",
      },
      {
        id: 3,
        header: t("age", "Age"),
        key: "age",
      },
      {
        id: 4,
        header: t("orderedFrom", "OrderedFrom"),
        key: "orderedFrom",
      },
      {
        id: 5,
        header: t("waitingTime", "Waiting Time"),
        key: "waitTime",
      },
      {
        id: 6,
        header: t("testsOrdered", "Tests Ordered"),
        key: "testsOrdered",
      },
    ],
    [t]
  );

  const tableRows = useMemo(() => {
    return paginatedQueueEntries?.map((entry) => ({
      ...entry,
      visitId: {
        content: <span>{trimVisitNumber(entry.visitNumber)}</span>,
      },
      patientNo: {
        content: <span>{entry?.identifiers[0].display}</span>,
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
      waitTime: {
        content: <span> {formatWaitTime(entry.waitTime, t)}</span>,
      },
      testsOrdered: {
        content: <span>Tests</span>,
      },
    }));
  }, [paginatedQueueEntries]);

  return (
    <DataTable rows={tableRows} headers={tableHeaders} useZebraStyles>
      {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
        <TableContainer className={styles.tableContainer}>
          <Table {...getTableProps()} className={styles.activePatientsTable}>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader {...getHeaderProps({ header })}>
                    {header.header?.content ?? header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => {
                return (
                  <React.Fragment key={row.id}>
                    <TableRow {...getRowProps({ row })} key={row.id}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>
                          {cell.value?.content ?? cell.value}
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
  );
};

export default TestsOrderedList;
