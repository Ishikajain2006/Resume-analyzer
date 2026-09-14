"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InterviewQuestion } from "@/lib/types";

export function InterviewQuestionCard({
  question,
  index,
}: {
  question: InterviewQuestion;
  index: number;
}) {
  return (
    <Card className="space-y-2 border-border/80 bg-card/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <span className="text-xs uppercase font-bold text-muted-foreground">
              Question {index}
            </span>
            <Badge variant="secondary" className="text-xs font-medium">
              {question.category}
            </Badge>
          </div>
          <Badge
            variant={
              question.difficulty === "Easy"
                ? "success"
                : question.difficulty === "Medium"
                ? "warning"
                : "destructive"
            }
            className="text-xs"
          >
            {question.difficulty}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm font-medium text-foreground leading-relaxed">
          {question.question}
        </p>

        <div className="rounded-lg bg-muted/40 p-3.5 space-y-2 border border-border/50">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Sample Answer Key Points:
          </h4>
          <ul className="space-y-1.5 text-xs text-foreground/80">
            {question.sampleAnswerKeyPoints.map((point, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
