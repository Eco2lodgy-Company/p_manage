"use client";
import React, { useEffect, useState, useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import { Card, CardFooter, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    total_taches: 0,
    taches_non_assignees: 0,
    taches_en_cours: 0,
    taches_terminees: 0,
    total_projets: 0,
    projets_en_cours: 0,
    projets_termines: 0,
    projets_non_demarres: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [latestTasks, setLatestTasks] = useState([]);
  const [latestProjects, setLatestProjects] = useState([]);

  const getDashData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://alphatek.fr:3110/api/dashboard/`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Erreur de réseau");
      }
      const data = await response.json();
      console.log("Dashboard API Response:", data.data);
      setDashboardData(data.data[0]); // Assuming data.data is an array
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      toast.error("Erreur lors de la récupération des données");
    } finally {
      setIsLoading(false);
    }
  };

  const getLatest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://alphatek.fr:3110/api/dashboard/prt`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Erreur de réseau");
      }
      const data = await response.json();
      console.log("Latest API Response:", data);

      // Adjust based on actual API response structure
      // Example: If response is { projects: [], tasks: [] }
      setLatestProjects(data.prodata || []); // Extract projects
      setLatestTasks(data.taskdata || []); // Extract tasks
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      toast.error("Erreur lors de la récupération des données");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getDashData();
    getLatest();
  }, []);

  // Debug state updates
  useEffect(() => {
    console.log("Updated latestTasks:", latestTasks);
    console.log("Updated latestProjects:", latestProjects);
  }, [latestTasks, latestProjects]);

  const chartData = useMemo(
    () => [
      { status: "termines", nombre: parseInt(dashboardData.projets_termines )|| 0, fill: "green" },
      { status: "en_cours", nombre: parseInt(dashboardData.projets_en_cours) || 0, fill: "yellow" },
      { status: "en_attente", nombre: parseInt(dashboardData.projets_non_demarres) || 0, fill: "orange" },
      
    ],
    [dashboardData]
  );

  const chartConfig = {
    nombre: { label: "Nombre" },
    termines: { label: "Terminés", color: "green" },
    en_cours: { label: "En Cours", color: "yellow" },
    en_attente: { label: "En Attente", color: "orange" },
  
  };
  const getstatusname = (name) => {
    const statusNames = {
      done: "Terminés",
      in_progress: "En Cours",
      pending: "En Attente",    
    };
    return statusNames[name] || name;
  };

  const totalNombre = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.nombre, 0);
  }, [chartData]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:ml-64 lg:ml-64 xl:ml-64">
      <ToastContainer />
      <div className="fixed top-0 left-0 md:left-64 lg:left-64 xl:left-64 right-0 bg-sky-500 text-white p-4 shadow-md text-center z-10">
        <h1 className="text-2xl font-bold">Tableau de Bord</h1>
      </div>
      <div className="mt-23 top-6 left-0 md:left-64 lg:left-64 xl:left-64 right-0 p-4 flex flex-wrap justify-between">
        <div className="bg-white p-4 rounded-lg shadow-md text-center border-l-4 border-red-500 w-full sm:w-[48%] md:w-[23%] mb-4">
          <h1 className="text-lg font-bold text-sky-700">Tâches Non Assignées</h1>
          <h1 className="text-3xl font-bold text-red-500">{dashboardData.taches_non_assignees || 0}</h1>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center border-l-4 border-yellow-500 w-full sm:w-[48%] md:w-[23%] mb-4">
          <h1 className="text-lg font-bold text-sky-700">Tâches En Cours</h1>
          <h1 className="text-3xl font-bold text-yellow-500">{dashboardData.taches_en_cours || 0}</h1>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center border-l-4 border-green-500 w-full sm:w-[48%] md:w-[23%] mb-4">
          <h1 className="text-lg font-bold text-sky-700">Tâches Terminées</h1>
          <h1 className="text-3xl font-bold text-green-500">{dashboardData.taches_terminees || 0}</h1>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center border-l-4 border-blue-500 w-full sm:w-[48%] md:w-[23%] mb-4">
          <h1 className="text-lg font-bold text-sky-700">Tâches Totales</h1>
          <h1 className="text-3xl font-bold text-blue-500">{dashboardData.total_taches || 0}</h1>
        </div>
      </div>
      <div className="flex-1 p-4 flex flex-row flex-wrap justify-around">
        <div className="bg-white border-l-4 border-sky-500 shadow-md rounded-lg p-6 max-w-md w-full mt-4 md:mt-0">
          <div className="flex flex-col space-y-6 w-full">
            <div className="bg-sky-50 p-4 rounded-lg shadow-sm text-center border border-sky-200">
              <h2 className="text-xl font-bold text-sky-700">Tâches</h2>
              <div className="flex flex-col space-y-2 mt-4">
                {isLoading ? (
                  <div>Loading tasks...</div>
                ) : latestTasks.length > 0 ? (
                  latestTasks.map((task, index) => (
                    <div
                      key={index}
                      className="bg-white flex flex-row justify-between p-3 rounded-lg shadow-sm hover:bg-sky-100 transition-colors border border-sky-200"
                    >
                      <h3 className="text-md font-semibold text-gray-800">{task.nom || "Unnamed Task"}</h3>
                      <div
                        className={`rounded-full px-3 py-1 text-white text-sm ${
                          task.state === "Terminée" ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      >
                        {getstatusname(task.state) || "Unknown"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div>No tasks available</div>
                )}
              </div>
            </div>
            <div className="bg-sky-50 p-4 rounded-lg shadow-sm text-center border border-sky-200">
              <h2 className="text-xl font-bold text-sky-700">Projets</h2>
              <div className="flex flex-col space-y-2 mt-4">
                {isLoading ? (
                  <div>Loading projects...</div>
                ) : latestProjects.length > 0 ? (
                  latestProjects.map((project, index) => (
                    <div
                      key={index}
                      className="bg-white flex flex-row justify-between p-3 rounded-lg shadow-sm hover:bg-sky-100 transition-colors border border-sky-200"
                    >
                      <h3 className="text-md font-semibold text-gray-800">{project.nom || "Unnamed Project"}</h3>
                      <div
                        className={`rounded-full px-3 py-1 text-white text-sm ${
                          project.state === "done" ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      >
                        {getstatusname(project.state) || "Unknown"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div>No projects available</div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white flex flex-col shadow-md rounded-lg p-6 max-w-md w-full text-center mt-4 md:mt-0 md:ml-4">
          <Card className="flex flex-col border-l-4 border-sky-500">
            <CardHeader className="items-center pb-0">
              <CardTitle className="text-xl font-bold text-sky-700">
                Statistiques des Projets
              </CardTitle>
              <CardDescription className="text-gray-600">
                {/* Janvier - Juin 2024 */}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              {isLoading ? (
                <div>Loading chart...</div>
              ) : (
                <>
                  <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                    <PieChart>
                      <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                      <Pie
                        data={chartData}
                        dataKey="nombre"
                        nameKey="status"
                        innerRadius={60}
                        strokeWidth={5}
                      >
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-3xl font-bold"
                                  >
                                    {dashboardData.total_projets || 0}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground"
                                  >
                                    Projets
                                  </tspan>
                                </text>
                              );
                            }
                          }}
                        />
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {chartData.map((item) => (
                      <div key={item.status} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: chartConfig[item.status].color }}
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {chartConfig[item.status].label}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 font-medium leading-none text-sky-700">
                {/* En hausse de 5.2% ce mois-ci <TrendingUp className="h-4 w-4" /> */}
              </div>
              <div className="leading-none text-muted-foreground">
                {/* Total des projets pour les 6 derniers mois */}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}