"use client";

import React, { useState } from "react";
import { Card } from "./ui/card";
import { ClockIcon, CheckIcon } from "lucide-react";

export interface InstructionStep {
  id: string;
  text: string;
  time?: number;
}

export interface RecipeInstructionsProps {
  instructions: InstructionStep[];
}

export function RecipeInstructions({ instructions }: RecipeInstructionsProps) {
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (stepId: string) => {
    setCheckedSteps((prev) => {
      const newChecked = new Set(prev);
      if (newChecked.has(stepId)) {
        newChecked.delete(stepId);
      } else {
        newChecked.add(stepId);
      }
      return newChecked;
    });
  };

  if (!instructions || instructions.length === 0) {
    return (
      <Card className="p-6 rounded-lg text-center text-muted-foreground">
        Geen instructies gevonden voor dit recept.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <ol className="list-none p-0 m-0 space-y-4">
        {instructions.map((step, index) => {
          const isChecked = checkedSteps.has(step.id);
          return (
            <li
              key={step.id}
              className={`flex items-start space-x-4 p-4 rounded-lg transition-colors cursor-pointer border ${isChecked ? "bg-green-50 border-green-200" : "bg-white hover:bg-gray-50 border-gray-200"}`}
              onClick={() => toggleStep(step.id)}
              role="checkbox"
              aria-checked={isChecked}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleStep(step.id);
                }
              }}
            >
              <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full border-2 data-[checked=true]:bg-green-600 data-[checked=true]:border-green-600 data-[checked=true]:text-white"
                   data-checked={isChecked}
              >
                {isChecked ? (
                  <CheckIcon className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-semibold text-gray-700">{index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <span
                  className={`block text-sm font-medium ${isChecked ? "line-through text-gray-500" : "text-gray-800"}`}
                >
                  {step.text}
                </span>
                {step.time !== undefined && (
                  <div className="flex items-center text-sm text-gray-500 mt-1.5">
                    <ClockIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                    <span>{step.time} min</span>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
} 