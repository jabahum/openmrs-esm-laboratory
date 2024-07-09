import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ConfigurableLink,
  formatDate,
  parseDate,
  usePagination,
  useSession,
} from "@openmrs/esm-framework";
import {
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Layer,
  Tile,
} from "@carbon/react";
import { getStatusColor } from "../utils/functions";
import styles from "./referred-orders.scss";
import { usePatientQueuesList } from "../tests-ordered/tests-ordered-list.resource";

const ReferredList: React.FC = () => {
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

  // table columns
  let columns = [
    { id: 0, header: t("patient", "Patient"), key: "patient" },

    { id: 1, header: t("orders", "Orders"), key: "orders" },
  ];
  const tableRows = useMemo(() => {
    return paginatedQueueEntries.map((entry, index) => ({
      ...entry,
      patient: "",
      orders: "",
    }));
  }, [paginatedQueueEntries]);

  return (
    <DataTable rows={tableRows} headers={columns} useZebraStyles>
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
        </TableContainer>
      )}
    </DataTable>
  );
};

export default ReferredList;
