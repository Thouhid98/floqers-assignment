import { useEffect, useState } from "react";
import Papa from "papaparse";
import DataTable from "react-data-table-component";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Table = () => {
  const [data, setData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [aggregatedData, setAggregatedData] = useState([]);

  useEffect(() => {
    fetch("/src/assets/salaries.csv")
      .then((response) => response.text())
      .then((csvData) => {
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            setData(result.data);
          },
        });
      })
      .catch((error) => console.error("Error fetching the CSV data:", error));
  }, []);

  const filteredData = data.filter((item) => {
    const year = parseInt(item.work_year, 10);
    return year >= 2020 && year <= 2024;
  });

  const aggregateJobTitles = (year) => {
    const jobsInYear = data.filter(
      (item) => parseInt(item.work_year, 10) === year
    );

    const jobTitleCounts = jobsInYear.reduce((acc, item) => {
      acc[item.job_title] = (acc[item.job_title] || 0) + 1;
      return acc;
    }, {});

    const result = Object.keys(jobTitleCounts).map((title) => ({
      job_title: title,
      count: jobTitleCounts[title],
    }));

    setAggregatedData(result);
  };

  const columns = [
    {
      name: "Year",
      selector: (row) => row.work_year,
      sortable: true,
      cell: (row) => (
        <span
          style={{ color: "blue", cursor: "pointer" }}
          onClick={() => {
            setSelectedYear(parseInt(row.work_year, 10));
            aggregateJobTitles(parseInt(row.work_year, 10));
          }}
        >
          {row.work_year}
        </span>
      ),
    },
    {
      name: "Number of Total Jobs",
      selector: (row) => row.remote_ratio,
      sortable: true,
    },
    {
      name: "Average Salary (USD)",
      selector: (row) => row.salary_in_usd,
      sortable: true,
    },
  ];

  const jobTitleColumns = [
    {
      name: "Job Title",
      selector: (row) => row.job_title,
      sortable: true,
    },
    {
      name: "Count",
      selector: (row) => row.count,
      sortable: true,
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#f0f0f0",
        fontWeight: "bold",
        fontSize: "20px",
      },
    },
    rows: {
      highlightOnHoverStyle: {
        backgroundColor: "#f9f9f9",
        fontSize: "16px",
      },
    },

    cells: {
      style: {
        fontSize: "16px",
      },
    },
  };

  return (
    <div>
      <div className="m-16 p-8">
        <h1 className="text-4xl font-bold mb-8  ">
          Machine Learning Engineer Salary Insights
        </h1>

        <DataTable
          columns={columns}
          data={data}
          pagination
          highlightOnHover
          pointerOnHover
          striped
          customStyles={customStyles}
        />

        {selectedYear && (
          <>
            <h2 className="text-2xl font-bold mt-8 mb-4">
              Job Titles for {selectedYear}
            </h2>
            <DataTable
              columns={jobTitleColumns}
              data={aggregatedData}
              pagination
              highlightOnHover
              pointerOnHover
              striped
              customStyles={customStyles}
            />
          </>
        )}

        <h2 className="text-2xl font-bold mt-8 mb-4">
          Average Salary (2020-2024)
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={filteredData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="work_year" tick={{ fontSize: 14 }} />
            <YAxis tick={{ fontSize: 14 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 14 }} />

            <Line
              type="monotone"
              dataKey="salary_in_usd"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Table;
