/* eslint-disable */
"use client";
import * as React from "react";
import { Button, Flex, Grid, TextField } from "@aws-amplify/ui-react";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { generateClient } from "aws-amplify/api";
import { getTaskLogs } from "./graphql/queries";
import { updateTaskLogs } from "./graphql/mutations";
const client = generateClient();
export default function TaskLogsUpdateForm(props) {
  const {
    id: idProp,
    taskLogs: taskLogsModelProp,
    onSuccess,
    onError,
    onSubmit,
    onValidate,
    onChange,
    overrides,
    ...rest
  } = props;
  const initialValues = {
    taskId: "",
    notes: "",
    completionDate: "",
    attachmentPath: "",
  };
  const [taskId, setTaskId] = React.useState(initialValues.taskId);
  const [notes, setNotes] = React.useState(initialValues.notes);
  const [completionDate, setCompletionDate] = React.useState(
    initialValues.completionDate
  );
  const [attachmentPath, setAttachmentPath] = React.useState(
    initialValues.attachmentPath
  );
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    const cleanValues = taskLogsRecord
      ? { ...initialValues, ...taskLogsRecord }
      : initialValues;
    setTaskId(cleanValues.taskId);
    setNotes(cleanValues.notes);
    setCompletionDate(cleanValues.completionDate);
    setAttachmentPath(cleanValues.attachmentPath);
    setErrors({});
  };
  const [taskLogsRecord, setTaskLogsRecord] = React.useState(taskLogsModelProp);
  React.useEffect(() => {
    const queryData = async () => {
      const record = idProp
        ? (
            await client.graphql({
              query: getTaskLogs.replaceAll("__typename", ""),
              variables: { id: idProp },
            })
          )?.data?.getTaskLogs
        : taskLogsModelProp;
      setTaskLogsRecord(record);
    };
    queryData();
  }, [idProp, taskLogsModelProp]);
  React.useEffect(resetStateValues, [taskLogsRecord]);
  const validations = {
    taskId: [],
    notes: [],
    completionDate: [{ type: "Required" }],
    attachmentPath: [],
  };
  const runValidationTasks = async (
    fieldName,
    currentValue,
    getDisplayValue
  ) => {
    const value =
      currentValue && getDisplayValue
        ? getDisplayValue(currentValue)
        : currentValue;
    let validationResponse = validateField(value, validations[fieldName]);
    const customValidator = fetchByPath(onValidate, fieldName);
    if (customValidator) {
      validationResponse = await customValidator(value, validationResponse);
    }
    setErrors((errors) => ({ ...errors, [fieldName]: validationResponse }));
    return validationResponse;
  };
  return (
    <Grid
      as="form"
      rowGap="15px"
      columnGap="15px"
      padding="20px"
      onSubmit={async (event) => {
        event.preventDefault();
        let modelFields = {
          taskId: taskId ?? null,
          notes: notes ?? null,
          completionDate,
          attachmentPath: attachmentPath ?? null,
        };
        const validationResponses = await Promise.all(
          Object.keys(validations).reduce((promises, fieldName) => {
            if (Array.isArray(modelFields[fieldName])) {
              promises.push(
                ...modelFields[fieldName].map((item) =>
                  runValidationTasks(fieldName, item)
                )
              );
              return promises;
            }
            promises.push(
              runValidationTasks(fieldName, modelFields[fieldName])
            );
            return promises;
          }, [])
        );
        if (validationResponses.some((r) => r.hasError)) {
          return;
        }
        if (onSubmit) {
          modelFields = onSubmit(modelFields);
        }
        try {
          Object.entries(modelFields).forEach(([key, value]) => {
            if (typeof value === "string" && value === "") {
              modelFields[key] = null;
            }
          });
          await client.graphql({
            query: updateTaskLogs.replaceAll("__typename", ""),
            variables: {
              input: {
                id: taskLogsRecord.id,
                ...modelFields,
              },
            },
          });
          if (onSuccess) {
            onSuccess(modelFields);
          }
        } catch (err) {
          if (onError) {
            const messages = err.errors.map((e) => e.message).join("\n");
            onError(modelFields, messages);
          }
        }
      }}
      {...getOverrideProps(overrides, "TaskLogsUpdateForm")}
      {...rest}
    >
      <TextField
        label="Task id"
        isRequired={false}
        isReadOnly={false}
        value={taskId}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              taskId: value,
              notes,
              completionDate,
              attachmentPath,
            };
            const result = onChange(modelFields);
            value = result?.taskId ?? value;
          }
          if (errors.taskId?.hasError) {
            runValidationTasks("taskId", value);
          }
          setTaskId(value);
        }}
        onBlur={() => runValidationTasks("taskId", taskId)}
        errorMessage={errors.taskId?.errorMessage}
        hasError={errors.taskId?.hasError}
        {...getOverrideProps(overrides, "taskId")}
      ></TextField>
      <TextField
        label="Notes"
        isRequired={false}
        isReadOnly={false}
        value={notes}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              taskId,
              notes: value,
              completionDate,
              attachmentPath,
            };
            const result = onChange(modelFields);
            value = result?.notes ?? value;
          }
          if (errors.notes?.hasError) {
            runValidationTasks("notes", value);
          }
          setNotes(value);
        }}
        onBlur={() => runValidationTasks("notes", notes)}
        errorMessage={errors.notes?.errorMessage}
        hasError={errors.notes?.hasError}
        {...getOverrideProps(overrides, "notes")}
      ></TextField>
      <TextField
        label="Completion date"
        isRequired={true}
        isReadOnly={false}
        type="date"
        value={completionDate}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              taskId,
              notes,
              completionDate: value,
              attachmentPath,
            };
            const result = onChange(modelFields);
            value = result?.completionDate ?? value;
          }
          if (errors.completionDate?.hasError) {
            runValidationTasks("completionDate", value);
          }
          setCompletionDate(value);
        }}
        onBlur={() => runValidationTasks("completionDate", completionDate)}
        errorMessage={errors.completionDate?.errorMessage}
        hasError={errors.completionDate?.hasError}
        {...getOverrideProps(overrides, "completionDate")}
      ></TextField>
      <TextField
        label="Attachment path"
        isRequired={false}
        isReadOnly={false}
        value={attachmentPath}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              taskId,
              notes,
              completionDate,
              attachmentPath: value,
            };
            const result = onChange(modelFields);
            value = result?.attachmentPath ?? value;
          }
          if (errors.attachmentPath?.hasError) {
            runValidationTasks("attachmentPath", value);
          }
          setAttachmentPath(value);
        }}
        onBlur={() => runValidationTasks("attachmentPath", attachmentPath)}
        errorMessage={errors.attachmentPath?.errorMessage}
        hasError={errors.attachmentPath?.hasError}
        {...getOverrideProps(overrides, "attachmentPath")}
      ></TextField>
      <Flex
        justifyContent="space-between"
        {...getOverrideProps(overrides, "CTAFlex")}
      >
        <Button
          children="Reset"
          type="reset"
          onClick={(event) => {
            event.preventDefault();
            resetStateValues();
          }}
          isDisabled={!(idProp || taskLogsModelProp)}
          {...getOverrideProps(overrides, "ResetButton")}
        ></Button>
        <Flex
          gap="15px"
          {...getOverrideProps(overrides, "RightAlignCTASubFlex")}
        >
          <Button
            children="Submit"
            type="submit"
            variation="primary"
            isDisabled={
              !(idProp || taskLogsModelProp) ||
              Object.values(errors).some((e) => e?.hasError)
            }
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
