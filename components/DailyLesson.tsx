"use client";

import { useEffect, useState } from "react";
import { supabase, DailyLesson as DailyLessonType } from "@/lib/supabase";

export default function DailyLesson() {
  const [lesson, setLesson] = useState<DailyLessonType | null>(null);

  useEffect(() => {
    fetchLesson();
  }, []);

  async function fetchLesson() {
    const { data } = await supabase
      .from("daily_lessons")
      .select("*")
      .order("date", { ascending: false })
      .limit(1)
      .single();
    if (data) setLesson(data);
  }

  if (!lesson) {
    return (
      <div className="max-w-[720px] mx-auto text-center py-16 animate-fade-in-delay-5">
        <p className="font-serif font-light italic text-lg text-secondary">
          The first lesson is yet to come.
        </p>
        <p className="font-sans font-light text-xs text-subtle mt-2">
          The nightly review runs at 23:30 UTC each day.
        </p>
        <div className="w-12 h-px bg-gold mx-auto mt-6" />
      </div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto animate-fade-in-delay-5">
      <div className="text-center mb-8">
        <h2 className="font-serif font-normal italic text-xl text-primary">
          Today&apos;s Lesson
        </h2>
        <div className="w-20 h-px bg-gold mx-auto mt-3" />
        <div className="mt-3 font-sans font-light text-[10px] tracking-luxury uppercase text-subtle">
          {new Date(lesson.date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </div>

      <div className="flex justify-center gap-8 mb-8 font-sans text-xs">
        <div className="text-center">
          <div className="font-light text-[10px] tracking-luxury uppercase text-subtle mb-1">
            Trades
          </div>
          <div className="font-serif font-light text-lg text-primary">
            {lesson.total_trades}
          </div>
        </div>
        <div className="w-px bg-border" />
        <div className="text-center">
          <div className="font-light text-[10px] tracking-luxury uppercase text-subtle mb-1">
            Wins
          </div>
          <div className="font-serif font-light text-lg text-positive">
            {lesson.wins}
          </div>
        </div>
        <div className="w-px bg-border" />
        <div className="text-center">
          <div className="font-light text-[10px] tracking-luxury uppercase text-subtle mb-1">
            Losses
          </div>
          <div className="font-serif font-light text-lg text-negative">
            {lesson.losses}
          </div>
        </div>
      </div>

      <div className="bg-surface-alt rounded-sm p-6 sm:p-8 mb-6">
        <p className="font-sans font-light text-sm text-secondary leading-[1.8] whitespace-pre-wrap">
          {lesson.lesson_text}
        </p>
      </div>

      {lesson.pattern_identified && (
        <div className="bg-surface rounded-sm border border-border p-6 mb-4">
          <div className="font-sans font-light text-[10px] tracking-luxury uppercase text-subtle mb-2">
            Pattern Identified
          </div>
          <p className="font-sans font-light text-sm text-primary">
            {lesson.pattern_identified}
          </p>
        </div>
      )}

      {lesson.adjustment_made && (
        <div className="bg-surface rounded-sm border-l-2 border-l-gold border border-border p-6">
          <div className="font-sans font-light text-[10px] tracking-luxury uppercase text-gold mb-2">
            Rule for Tomorrow
          </div>
          <p className="font-sans font-light text-sm text-primary">
            {lesson.adjustment_made}
          </p>
        </div>
      )}
    </div>
  );
}
