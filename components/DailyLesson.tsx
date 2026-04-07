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
      <div className="bg-card rounded-xl p-4 border border-white/5">
        <h2 className="text-white font-semibold mb-3">
          Today&apos;s Lesson
        </h2>
        <p className="text-muted text-sm">
          Bot hasn&apos;t completed its first nightly review yet. Check back after 23:30 UTC!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-white/5 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-semibold">
          What the Bot Learned
        </h2>
        <span className="text-xs text-muted bg-white/5 px-2 py-0.5 rounded">
          {new Date(lesson.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      <div className="flex gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1">
          <span className="text-muted">Trades:</span>
          <span className="text-white font-medium">{lesson.total_trades}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-muted">Wins:</span>
          <span className="text-accent font-medium">{lesson.wins}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-muted">Losses:</span>
          <span className="text-negative font-medium">{lesson.losses}</span>
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-3 mb-3">
        <div className="text-xs text-muted uppercase tracking-wider mb-1">
          Lesson
        </div>
        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
          {lesson.lesson_text}
        </p>
      </div>

      {lesson.pattern_identified && (
        <div className="bg-accent/5 border border-accent/10 rounded-lg p-3 mb-3">
          <div className="text-xs text-accent uppercase tracking-wider mb-1">
            Pattern Identified
          </div>
          <p className="text-sm text-gray-300">{lesson.pattern_identified}</p>
        </div>
      )}

      {lesson.adjustment_made && (
        <div className="bg-yellow-400/5 border border-yellow-400/10 rounded-lg p-3">
          <div className="text-xs text-yellow-400 uppercase tracking-wider mb-1">
            Rule for Tomorrow
          </div>
          <p className="text-sm text-gray-300">{lesson.adjustment_made}</p>
        </div>
      )}
    </div>
  );
}
