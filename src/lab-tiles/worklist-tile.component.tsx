import React from "react";
import { useTranslation } from "react-i18next";
import SummaryTile from "../summary-tiles/summary-tile.component";
import { useLabTestsStats } from "../summary-tiles/laboratory-summary.resource";
import dayjs from "dayjs";

const WorklistTileComponent = () => {
  const { t } = useTranslation();
  const today = dayjs(new Date()).format("YYYY-MM-DD");

  const { data } = useLabTestsStats("IN_PROGRESS", today);

  const filteredData = data?.filter(
    (item) =>
      item?.fulfillerStatus === "IN_PROGRESS" &&
      item?.accessionNumber !== null &&
      item?.dateStopped === null &&
      item?.instructions !== "REFER TO cphl"
  );

  return (
    <SummaryTile
      label={t("inProgress", "In progress")}
      value={filteredData?.length}
      headerLabel={t("worklist", "Ex-Worklist")}
    />
  );
};

export default WorklistTileComponent;
