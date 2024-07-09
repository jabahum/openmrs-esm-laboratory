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
} from "@carbon/react";

import { useTranslation } from "react-i18next";
import { usePagination, useSession } from "@openmrs/esm-framework";
import styles from "./laboratory-queue.scss";
import { usePatientQueuesList } from "./tests-ordered-list.resource";

const TestsOrderedList: React.FC = () => {
  const { t } = useTranslation();
  const session = useSession();

  const { patientQueueEntries, isLoading } = usePatientQueuesList(
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

  // get patients in queue
  let columns = [
    { id: 0, header: t("visitId", "Visit ID"), key: "visitId" },
    { id: 1, header: t("patientNumber", "Patient No."), key: "patientNumber" },
    { id: 2, header: t("names", "Name"), key: "patient" },
    { id: 3, header: t("age", "Age"), key: "age" },
    { id: 4, header: t("orderedFrom", "Ordered From"), key: "orderedFrom" },
    { id: 5, header: t("waitingTime", "Waiting Time"), key: "waitingTime" },
    {
      id: 6,
      header: t("testsOrdered", "Test(s) Ordered"),
      key: "testsOrdered",
    },
  ];

  const tableRows = useMemo(() => {
    return paginatedQueueEntries.map((entry, index) => {
      return {
        ...entry,
        visitId: entry?.uuid,
        patientNumber: entry.patient?.identifiers[0].display,
        names: entry?.patient?.display.split("-")[1],
        age: "",
        orderedFrom: "",
        waitingTime: "",
        testsOrdered: "",
      };
    });
  }, []);

  return (
    <DataTable
      rows={tableRows}
      headers={columns}
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
                    {header.header?.content ?? header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
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
        </TableContainer>
      )}
    </DataTable>
  );
};

export default TestsOrderedList;
