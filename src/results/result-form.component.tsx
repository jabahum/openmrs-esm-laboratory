import React, { useMemo, useState } from "react";
import styles from "./result-form.scss";
import {
  Button,
  InlineLoading,
  TextInput,
  Select,
  SelectItem,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@carbon/react";
import { useTranslation } from "react-i18next";
import { closeOverlay } from "../components/overlay/hook";
import {
  ExtensionSlot,
  showNotification,
  showToast,
  usePatient,
} from "@openmrs/esm-framework";
import {
  UpdateEncounter,
  useGetOrderConceptByUuid,
} from "./result-form.resource";
import { Result } from "../work-list/work-list.resource";

interface ResultFormProps {
  patientUuid: string;
  order: Result;
}

const ResultForm: React.FC<ResultFormProps> = ({ order, patientUuid }) => {
  const { t } = useTranslation();

  const { patient, isLoading } = usePatient(patientUuid);

  const { concept } = useGetOrderConceptByUuid(order.concept.uuid);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [inputValues, setInputValues] = useState({});

  const [selectedOption, setSelectedOption] = useState();

  const bannerState = useMemo(() => {
    if (patient) {
      return {
        patient,
        patientUuid,
        hideActionsOverflow: true,
      };
    }
  }, [patient, patientUuid]);

  // getInput values
  const handleInputChange = (memberUuid, value) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [memberUuid]: value,
    }));
  };

  // create input fields
  const Questions = ({ conceptMembers }) => {
    const inputFields = useMemo(() => {
      return conceptMembers.map((member) => {
        let inputField;

        if (
          member.datatype.display === "Text" ||
          member.datatype.display === "Numeric"
        ) {
          inputField = (
            <TextInput
              key={member.uuid}
              className={styles.textInput}
              name={`member-${member.uuid}-test-id`}
              id={`member-${member.uuid}-test-id`}
              type={member.datatype.display === "Numeric" ? "number" : "text"}
              labelText={member?.display}
              value={inputValues[member.uuid] || ""}
              onChange={(e) => handleInputChange(member.uuid, e.target.value)}
            />
          );
        } else if (member.datatype.display === "Coded") {
          inputField = (
            <Select
              key={member.uuid}
              className={styles.textInput}
              name={`member-${member.uuid}-test-id`}
              id={`member-${member.uuid}-test-id`}
              type="text"
              labelText={member?.display}
              value={inputValues[member.uuid] || ""}
              onChange={(e) => handleInputChange(member.uuid, e.target.value)}
            >
              {!setSelectedOption ? (
                <SelectItem text={t("option", "Choose an Option")} value="" />
              ) : null}
              {member?.answers?.map((answer) => (
                <SelectItem
                  key={answer.uuid}
                  text={answer.display}
                  value={answer.uuid}
                >
                  {answer.display}
                </SelectItem>
              ))}
            </Select>
          );
        }

        return inputField;
      });
    }, [conceptMembers]); // Memoize when conceptMembers changes

    return <>{inputFields}</>;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // assign value to test
    let groupMembers = [];
    let obsValue = [];
    const ob = {
      concept: { uuid: order.concept.uuid },
      status: "FINAL",
      order: { uuid: order.uuid },
      groupMembers: groupMembers,
    };
    concept.forEach((item) => {
      let value;
      if (
        item.datatype.display === "Numeric" ||
        item.datatype.display === "Text"
      ) {
        value = inputValues[`${item.uuid}`];
      } else if (item.datatype.display === "Coded") {
        value = {
          uuid: inputValues[`${item.uuid}`],
        };
      }
      const groupMember = {
        concept: { uuid: item.uuid },
        value: value,
        status: "FINAL",
        order: { uuid: order.uuid },
      };
      groupMembers.push(groupMember);
    });
    obsValue.push(ob);

    const payload = {
      obs: obsValue,
    };
    setIsSubmitting(true);

    console.info("payload--->", payload);
    // update encounter
    UpdateEncounter(order.encounter.uuid, payload).then(
      () => {
        setIsSubmitting(false);
        showToast({
          critical: true,
          title: t("updateEncounter", "Update Encounter"),
          kind: "success",
          description: t(
            "generateSuccessfully",
            "You have successfully encounter with test results"
          ),
        });
      },
      (err) => {
        setIsSubmitting(false);
        showNotification({
          title: t(
            `errorUpdatingEncounter', 'Error occurred while updating encounter`
          ),
          kind: "error",
          critical: true,
          description: err?.message,
        });
      }
    );
  };

  return (
    <>
      <div className="">
        <ModalBody>
          {isLoading && (
            <InlineLoading
              className={styles.bannerLoading}
              iconDescription="Loading"
              description="Loading banner"
              status="active"
            />
          )}
          {patient && (
            <ExtensionSlot name="patient-header-slot" state={bannerState} />
          )}

          {concept?.length > 0 && (
            <section className={styles.section}>
              <Questions conceptMembers={concept} />
            </section>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            disabled={isSubmitting}
            onClick={() => closeOverlay()}
            kind="secondary"
          >
            {t("cancel", "Cancel")}
          </Button>
          <Button onClick={(e) => handleSubmit(e)}>Save tests</Button>
        </ModalFooter>
      </div>
    </>
  );
};

export default ResultForm;
