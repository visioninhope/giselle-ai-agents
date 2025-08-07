"use client";

import { Button } from "@giselle-internal/ui/button";
import { Select } from "@giselle-internal/ui/select";
import type { FlowTrigger, FlowTriggerId } from "@giselle-sdk/data-type";
import type { ParameterItem } from "@giselle-sdk/giselle";
import { SpinnerIcon } from "@giselles-ai/icons/spinner";
import clsx from "clsx/lite";
import type { InferSelectModel } from "drizzle-orm";
import { useActionState, useCallback, useMemo, useState } from "react";
import type { teams } from "@/drizzle";
import {
  createInputsFromTrigger,
  parseFormInputs,
  toParameterItems,
} from "./helpers";

type TeamId = InferSelectModel<typeof teams>["id"];
interface TeamOption {
  value: TeamId;
  label: string;
}

export interface FlowTriggerUIItem {
  id: FlowTriggerId;
  teamId: TeamId;
  workspaceName: string;
  label: string;
  sdkData: FlowTrigger;
}

interface PerformStagePayloads {
  teamId: TeamId;
  flowTrigger: FlowTrigger;
  parameterItems: ParameterItem[];
}

type PerformStageAction = (payloads: PerformStagePayloads) => Promise<void>;

export function Form({
  teamOptions,
  flowTriggers,
  performStageAction,
}: {
  teamOptions: TeamOption[];
  flowTriggers: FlowTriggerUIItem[];
  performStageAction: PerformStageAction;
}) {
  const defaultTeamId = useMemo(() => teamOptions[0].value, [teamOptions]);
  const [selectedTeamId, setSelectedTeamId] = useState<TeamId>(defaultTeamId);
  const defaultSelectedFlowTriggerId = useMemo(
    () =>
      flowTriggers.find((flowTrigger) => flowTrigger.teamId === defaultTeamId)
        ?.id,
    [flowTriggers, defaultTeamId],
  );
  const [selectedFlowTriggerId, setSelectedFlowTriggerId] = useState<
    FlowTriggerId | undefined
  >(defaultSelectedFlowTriggerId);

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const filteredFlowTriggers = useMemo(
    () =>
      flowTriggers.filter(
        (flowTrigger) => flowTrigger.teamId === selectedTeamId,
      ),
    [flowTriggers, selectedTeamId],
  );

  const inputs = useMemo(
    () =>
      createInputsFromTrigger(
        filteredFlowTriggers.find(
          (flowTrigger) => flowTrigger.id === selectedFlowTriggerId,
        )?.sdkData,
      ),
    [selectedFlowTriggerId, filteredFlowTriggers],
  );

  const formAction = useCallback(
    async (_prevState: unknown, formData: FormData) => {
      if (selectedFlowTriggerId === undefined) {
        return null;
      }
      const { errors, values } = parseFormInputs(inputs, formData);

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return null;
      }

      setValidationErrors({});

      const flowTrigger = filteredFlowTriggers.find(
        (flowTrigger) => flowTrigger.id === selectedFlowTriggerId,
      );
      if (flowTrigger === undefined) {
        throw new Error(
          `Flow trigger with ID ${selectedFlowTriggerId} not found`,
        );
      }

      await performStageAction({
        teamId: selectedTeamId,
        flowTrigger: flowTrigger.sdkData,
        parameterItems: toParameterItems(inputs, values),
      });
      return null;
    },
    [
      inputs,
      performStageAction,
      selectedFlowTriggerId,
      selectedTeamId,
      filteredFlowTriggers,
    ],
  );

  const [, action, isPending] = useActionState(formAction, null);

  return (
    <div className="max-w-[800px] mx-auto relative">
      <div
        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-3/4 h-8 rounded-full opacity-60"
        style={{
          background:
            "radial-gradient(ellipse, rgba(59, 130, 246, 0.4) 0%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />
      <div
        className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-1/2 h-4 rounded-full opacity-80"
        style={{
          background:
            "radial-gradient(ellipse, rgba(59, 130, 246, 0.6) 0%, transparent 70%)",
          filter: "blur(4px)",
        }}
      />
      <form
        action={action}
        className="relative bg-[var(--color-stage-form-background)] rounded-xl shadow-[var(--shadow-stage-form)] border border-white/10 p-4 text-[14px] text-text resize-none outline-none"
        style={{
          boxShadow: `
            var(--shadow-stage-form),
            0 0 0 1px rgba(59, 130, 246, 0.1),
            0 0 20px rgba(59, 130, 246, 0.1),
            0 0 40px rgba(59, 130, 246, 0.05),
            inset 0 -1px 0 rgba(59, 130, 246, 0.3)
          `,
        }}
      >
        <div
          className="absolute inset-x-0 bottom-0 h-[2px] rounded-b-xl"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.6), transparent)",
            filter: "blur(1px)",
          }}
        />
        <div className="flex flex-col gap-[8px] mb-[8px]">
          {inputs.map((input) => {
            return (
              <fieldset key={input.name} className={clsx("grid gap-2")}>
                <label
                  className="text-[14px] font-medium text-white-900"
                  htmlFor={input.name}
                >
                  {input.label}
                  {input.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                {input.type === "text" && (
                  <input
                    type="text"
                    name={input.name}
                    id={input.name}
                    className={clsx(
                      "w-full flex justify-between items-center rounded-[8px] py-[8px] px-[12px] outline-none focus:outline-none border",
                      validationErrors[input.name]
                        ? "border-error"
                        : "border-border",
                      "text-[14px]",
                    )}
                    disabled={isPending}
                  />
                )}
                {input.type === "multiline-text" && (
                  <textarea
                    name={input.name}
                    id={input.name}
                    className={clsx(
                      "w-full flex justify-between items-center rounded-[8px] py-[8px] px-[12px] outline-none focus:outline-none",
                      "border-[1px]",
                      validationErrors[input.name]
                        ? "border-error"
                        : "border-border",
                      "text-[14px]",
                    )}
                    rows={4}
                    disabled={isPending}
                  />
                )}
                {input.type === "number" && (
                  <input
                    type="number"
                    name={input.name}
                    id={input.name}
                    className={clsx(
                      "w-full flex justify-between items-center rounded-[8px] py-[8px] px-[12px] outline-none focus:outline-none",
                      "border-[1px]",
                      validationErrors[input.name]
                        ? "border-error"
                        : "border-border",
                      "text-[14px]",
                    )}
                    disabled={isPending}
                  />
                )}
                {validationErrors[input.name] && (
                  <span className="text-error text-[12px] font-medium">
                    {validationErrors[input.name]}
                  </span>
                )}
              </fieldset>
            );
          })}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 justify-center">
            <Select
              id="team"
              placeholder="Select team"
              options={teamOptions}
              renderOption={(o) => o.label}
              value={selectedTeamId}
              onValueChange={(value) => setSelectedTeamId(value as TeamId)}
            />
            <Select
              id="flow"
              placeholder="Select flow"
              options={
                filteredFlowTriggers.length === 0
                  ? [
                      {
                        value: "no-flow",
                        label: "No flows available",
                      },
                    ]
                  : filteredFlowTriggers.map((trigger) => ({
                      value: trigger.id,
                      label: `${trigger.workspaceName} / ${trigger.label}`,
                    }))
              }
              renderOption={(o) => o.label}
              value={selectedFlowTriggerId}
              onValueChange={(value) => {
                const selectedFlowTrigger = filteredFlowTriggers.find(
                  (flowTrigger) => flowTrigger.id === (value as FlowTriggerId),
                );
                if (selectedFlowTrigger === undefined) {
                  return;
                }
                setSelectedFlowTriggerId(selectedFlowTrigger.id);
              }}
            />
          </div>
          <Button
            variant="solid"
            size="large"
            type="submit"
            disabled={isPending}
            leftIcon={
              isPending && (
                <SpinnerIcon className="animate-follow-through-overlap-spin size-[18px]" />
              )
            }
          >
            {isPending ? "Setting the stage…" : "Start"}
          </Button>
        </div>
      </form>
    </div>
  );
}
