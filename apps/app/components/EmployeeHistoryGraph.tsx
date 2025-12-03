import { DeepPartial } from "@apollo/client/utilities";
import { IEmployeeHistory } from "@em-plor/contracts";
import { CheckIcon, BriefcaseIcon } from "@heroicons/react/20/solid";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

function formatDate(date: Date | string | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface EmployeeHistoryGraphProps {
  histories: DeepPartial<IEmployeeHistory>[];
}

export default function EmployeeHistoryGraph({
  histories,
}: EmployeeHistoryGraphProps) {
  // Sort histories by startDate (most recent first)
  const sortedHistories = [...histories].sort((a, b) => {
    const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
    const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {sortedHistories.map((history, historyIdx) => {
          const isOngoing = !history.endDate;
          const Icon = isOngoing ? BriefcaseIcon : CheckIcon;
          const iconBackground = isOngoing ? "bg-cyan-500" : "bg-green-500";

          return (
            <li key={history.id}>
              <div className="relative pb-8">
                {historyIdx !== sortedHistories.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span
                      className={classNames(
                        iconBackground,
                        "flex size-8 items-center justify-center rounded-full ring-8 ring-white",
                      )}
                    >
                      <Icon aria-hidden="true" className="size-5 text-white" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-500">
                        {isOngoing ? "Currently" : "Worked as"}{" "}
                        <span className="font-medium text-gray-900">
                          {history.position?.name || "Unknown Position"}
                        </span>
                        {" in "}
                        <span className="font-medium text-gray-900">
                          {history.department?.name || "Unknown Department"}
                        </span>
                      </p>
                    </div>
                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                      <div>
                        <time dateTime={history.startDate?.toString()}>
                          {formatDate(history.startDate)}
                        </time>
                        {history.endDate && (
                          <>
                            {" - "}
                            <time dateTime={history.endDate.toString()}>
                              {formatDate(history.endDate)}
                            </time>
                          </>
                        )}
                        {isOngoing && (
                          <span className="text-cyan-600 font-medium">
                            {" "}
                            (Current)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
