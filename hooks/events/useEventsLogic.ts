// hooks/useEventsLogic.ts
import { useMemo } from "react";
import {
  CategorizedEvents,
  Event as EventType,
} from "@/contexts/UserEventsContext";

export function useEventsLogic(events: CategorizedEvents) {
  const pastEventsByMonth = useMemo(() => {
    return groupEventsByMonth(events.past);
  }, [events.past]);

  const hasNoEvents = useMemo(() => {
    return (
      events.current.length === 0 &&
      events.planned.length === 0 &&
      Object.keys(pastEventsByMonth).length === 0
    );
  }, [events.current.length, events.planned.length, pastEventsByMonth]);

  return {
    pastEventsByMonth,
    hasNoEvents,
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

  // Sort months in descending order (most recent first)
  // Create a mapping of monthYear to the earliest date in that month for sorting
  const monthYearToDate = new Map<string, Date>();

  Object.entries(grouped).forEach(([monthYear, monthEvents]) => {
    // Find the earliest date in this month for sorting
    const earliestDate = monthEvents.reduce((earliest, event) => {
      const eventDate = new Date(event.date);
      return eventDate < earliest ? eventDate : earliest;
    }, new Date(monthEvents[0].date));

    monthYearToDate.set(monthYear, earliestDate);
  });

  const sortedGrouped = Object.fromEntries(
    Object.entries(grouped).sort(([monthYearA], [monthYearB]) => {
      const dateA = monthYearToDate.get(monthYearA)!;
      const dateB = monthYearToDate.get(monthYearB)!;
      return dateB.getTime() - dateA.getTime();
    })
  );

  return sortedGrouped;
}
