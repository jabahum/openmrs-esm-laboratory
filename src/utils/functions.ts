import {
  getGlobalStore,
  openmrsFetch,
  restBaseUrl,
} from "@openmrs/esm-framework";
import dayjs from "dayjs";
import useSWR from "swr";
import { omrsDateFormat } from "../constants";
import { useEffect, useState } from "react";

export const trimVisitNumber = (visitNumber: string) => {
  if (!visitNumber) {
    return;
  }
  return visitNumber.substring(15);
};

export const formatWaitTime = (waitTime: string, t) => {
  const num = parseInt(waitTime);
  const hours = num / 60;
  const rhours = Math.floor(hours);
  const minutes = (hours - rhours) * 60;
  const rminutes = Math.round(minutes);
  if (rhours > 0) {
    return (
      rhours +
      " " +
      `${t("hoursAnd", "hours and ")}` +
      rminutes +
      " " +
      `${t("minutes", "minutes")}`
    );
  } else {
    return rminutes + " " + `${t("minutes", "minutes")}`;
  }
};

export const getTagColor = (waitTime: string) => {
  const num = parseInt(waitTime);
  if (num <= 30) {
    return "green";
  } else if (num > 30 && num <= 45) {
    return "orange";
  } else {
    return "red";
  }
};

export const getStatusColor = (fulfillerStatus: string) => {
  if (fulfillerStatus === "COMPLETED") {
    return "green";
  } else if (fulfillerStatus === "IN_PROGRESS") {
    return "orange";
  } else {
    return "red";
  }
};

export interface PatientResource {
  uuid: string;
  display: string;
  identifiers: Identifier[];
  person: Person;
  voided: boolean;
  auditInfo: AuditInfo;
  links: Link[];
  resourceVersion: string;
}

export interface Identifier {
  display: string;
  uuid: string;
  identifier: string;
  identifierType: IdentifierType;
  location: Location;
  preferred: boolean;
  voided: boolean;
  links: Link[];
  resourceVersion: string;
}

export interface IdentifierType {
  uuid: string;
  display: string;
  links: Link[];
}

export interface Link {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Location {
  uuid: string;
  display: string;
  links: Link[];
}

export interface Person {
  uuid: string;
  display: string;
  gender: string;
  age: number;
  birthdate: string;
  birthdateEstimated: boolean;
  dead: boolean;
  deathDate: any;
  causeOfDeath: any;
  preferredName: PreferredName;
  preferredAddress: PreferredAddress;
  names: Name[];
  addresses: Address[];
  attributes: Attribute[];
  voided: boolean;
  auditInfo: AuditInfo;
  birthtime: any;
  deathdateEstimated: boolean;
  causeOfDeathNonCoded: any;
  links: Link[];
  resourceVersion: string;
}

export interface PreferredName {
  display: string;
  uuid: string;
  givenName: string;
  middleName: string;
  familyName: string;
  familyName2: any;
  voided: boolean;
  links: Link[];
  resourceVersion: string;
}

export interface PreferredAddress {
  display: any;
  uuid: string;
  preferred: boolean;
  address1: any;
  address2: any;
  cityVillage: any;
  stateProvince: string;
  country: string;
  postalCode: any;
  countyDistrict: string;
  address3: string;
  address4: string;
  address5: string;
  address6: any;
  startDate: any;
  endDate: any;
  latitude: any;
  longitude: any;
  voided: boolean;
  address7: any;
  address8: any;
  address9: any;
  address10: any;
  address11: any;
  address12: any;
  address13: any;
  address14: any;
  address15: any;
  links: Link[];
  resourceVersion: string;
}

export interface Name {
  display: string;
  uuid: string;
  givenName: string;
  middleName: string;
  familyName: string;
  familyName2: any;
  voided: boolean;
  links: Link[];
  resourceVersion: string;
}

export interface Address {
  display: any;
  uuid: string;
  preferred: boolean;
  address1: any;
  address2: any;
  cityVillage: any;
  stateProvince: string;
  country: string;
  postalCode: any;
  countyDistrict: string;
  address3: string;
  address4: string;
  address5: string;
  address6: any;
  startDate: any;
  endDate: any;
  latitude: any;
  longitude: any;
  voided: boolean;
  address7: any;
  address8: any;
  address9: any;
  address10: any;
  address11: any;
  address12: any;
  address13: any;
  address14: any;
  address15: any;
  links: Link[];
  resourceVersion: string;
}

export interface Attribute {
  display: string;
  uuid: string;
  value: string;
  attributeType: AttributeType;
  voided: boolean;
  links: Link[];
  resourceVersion: string;
}

export interface AttributeType {
  uuid: string;
  display: string;
  links: Link[];
}

export interface AuditInfo {
  creator: Creator;
  dateCreated: string;
  changedBy: any;
  dateChanged: any;
}

export interface Creator {
  uuid: string;
  display: string;
  links: Link[];
}

export function useGetPatientByUuid(uuid: string) {
  const apiUrl = `${restBaseUrl}/patient/${uuid}?v=full`;
  const { data, error, isLoading } = useSWR<{ data: PatientResource }, Error>(
    apiUrl,
    openmrsFetch
  );
  return {
    patient: data?.data,
    isLoading,
    isError: error,
  };
}

export function OrderTagStyle(order: any) {
  switch (order?.action) {
    case "NEW" || "REVISE":
      return {
        background: "#6F6F6F",
        color: "white",
      };

    case "DISCONTINUE":
      return {
        background: "green",
        color: "white",
      };

    case "DECLINED" || "EXCEPTION":
      return {
        background: "red",
        color: "white",
      };

    default:
      return {
        background: "gray",
        color: "white",
      };
  }
}

export function extractErrorMessagesFromResponse(errorObject) {
  const fieldErrors = errorObject?.responseBody?.error?.fieldErrors;
  if (!fieldErrors) {
    return [errorObject?.responseBody?.error?.message ?? errorObject?.message];
  }
  return Object.values(fieldErrors).flatMap((errors: Array<Error>) =>
    errors.map((error) => error.message)
  );
}

// orders date globally
const initialState = {
  ordersDate: dayjs(new Date().setHours(0, 0, 0, 0)).format(omrsDateFormat),
};

export function getStartDate() {
  return getGlobalStore<{ ordersDate: string | Date }>(
    "ordersStartDate",
    initialState
  );
}

export function changeStartDate(updatedDate: string | Date) {
  const store = getStartDate();
  store.setState({
    ordersDate: dayjs(new Date(updatedDate).setHours(0, 0, 0, 0)).format(
      omrsDateFormat
    ),
  });
}

export const useOrderDate = () => {
  const [currentOrdersDate, setCurrentOrdersDate] = useState(
    initialState.ordersDate
  );

  useEffect(() => {
    getStartDate().subscribe(({ ordersDate }) =>
      setCurrentOrdersDate(ordersDate.toString())
    );
  }, []);

  return { currentOrdersDate, setCurrentOrdersDate };
};
