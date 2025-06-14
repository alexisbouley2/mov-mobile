// hooks/useEventsLogic.ts
import { useMemo } from "react";
import { CategorizedEvents, Event as EventType } from "@/hooks/useEvents";

export function useEventsLogic(events: CategorizedEvents) {
  const pastEventsByMonth = useMemo(() => {
    return groupEventsByMonth(events.past);
  }, [events.past]);

  return {
    pastEventsByMonth,
  };
}

function groupEventsByMonth(events: EventType[]) {
  const grouped = events.reduce((acc, event) => {
    const eventDate = new Date(event.date);

    const monthYear = eventDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(event);

    return acc;
  }, {} as Record<string, EventType[]>);

  return grouped;
}
