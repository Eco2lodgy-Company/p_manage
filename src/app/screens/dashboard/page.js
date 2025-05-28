"use client";
import React, { useEffect, useState, useMemo } from "react";
import { TrendingUp, PlusCircle } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    total_employes: 0,
    budget_utilise: 0,
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
      setDashboardData({
        ...data.data[0],
        total_employes: 85, // Mocked for the "Employés" card
        budget_utilise: 68, // Mocked for the "Budget utilisé" card
      });
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

      // Mocked data to match the image
      setLatestProjects([
        { nom: "Rapport de projet mis à jour", state: "done" },
        { nom: "Tâche complétée: Design de l'interface", state: "done" },
        { nom: "Il y a 2 heures par Sophie M.", state: "in_progress" },
        { nom: "Il y a 5 heures par Mario C.", state: "pending" },
      ]);
      setLatestTasks([
        { nom: "Finaliser le rapport mensuel", echeance: "Aujourd'hui" },
        { nom: "Réunion avec les investisseurs", echeance: "14/10/2025" },
        { nom: "Révision du plan marketing", echeance: "15/10/2025" },
        { nom: "Formation équipe développement", echeance: "10/10/2025" },
      ]);
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

  // Pie Chart Data for "Répartition département"
  const chartData = useMemo(
    () => [
      { status: "R&D", nombre: 48, fill: "var(--chart-1)" },
      { status: "Marketing", nombre: 30, fill: "var(--chart-2)" },
      { status: "Finance", nombre: 20, fill: "var(--chart-3)" },
    ],
    []
  );

  const chartConfig = {
    nombre: { label: "Nombre" },
    "R&D": { label: "R&D", color: "var(--chart-1)" },
    Marketing: { label: "Marketing", color: "var(--chart-2)" },
    Finance: { label: "Finance", color: "var(--chart-3)" },
  };

  const totalNombre = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.nombre, 0);
  }, [chartData]);

  const getStatusName = (name) => {
    const statusNames = {
      done: "Terminé",
      in_progress: "En Cours",
      pending: "En Attente",
    };
    return statusNames[name] || name;
  };

  const getStatusColor = (state) => {
    switch (state) {
      case "done":
        return "border-l-chart-2"; // Green
      case "in_progress":
        return "border-l-chart-1"; // Blue
      case "pending":
        return "border-l-destructive"; // Red
      default:
        return "border-l-muted";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <ToastContainer />
      <div className="fixed top-0 left-0 right-0 bg-background text-foreground p-4 shadow-md text-center z-10">
        <h1 className="text-2xl font-bold">Tableau de Bord</h1>
      </div>
      <div className="mt-16 p-4 flex flex-wrap justify-between gap-4">
        {/* Top Cards */}
        <Card className="bg-card text-card-foreground p-4 rounded-lg shadow-md text-center border-l-4 border-l-chart-1 w-full sm:w-[48%] md:w-[23%]">
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-bold">Projets actifs</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <h1 className="text-3xl font-bold">{dashboardData.total_projets || 12}</h1>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <TrendingUp className="h-4 w-4 text-chart-2" /> +4% par rapport au dernier mois
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground p-4 rounded-lg shadow-md text-center border-l-4 border-l-chart-2 w-full sm:w-[48%] md:w-[23%]">
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-bold">Tâches en cours</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <h1 className="text-3xl font-bold">{dashboardData.taches_en_cours || 42}</h1>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <TrendingUp className="h-4 w-4 text-destructive" /> -3% par rapport au dernier mois
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground p-4 rounded-lg shadow-md text-center border-l-4 border-l-chart-3 w-full sm:w-[48%] md:w-[23%]">
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-bold">Employés</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <h1 className="text-3xl font-bold">{dashboardData.total_employes || 85}</h1>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <TrendingUp className="h-4 w-4 text-chart-2" /> +12% par rapport au dernier mois
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground p-4 rounded-lg shadow-md text-center border-l-4 border-l-chart-4 w-full sm:w-[48%] md:w-[23%]">
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-bold">Budget utilisé</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <h1 className="text-3xl font-bold">{dashboardData.budget_utilise || 68}%</h1>
            <div className="w-full bg-muted h-2 rounded-full mt-2">
              <div
                className="bg-chart-4 h-2 rounded-full"
                style={{ width: `${dashboardData.budget_utilise || 68}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 p-4 flex flex-row flex-wrap justify-around gap-4">
        {/* Left Section: Progress and Recent Activities */}
        <div className="flex flex-col w-full md:w-[48%] gap-4">
          {/* Progress Chart (Placeholder) */}
          <Card className="bg-card text-card-foreground shadow-md rounded-lg p-6">
            <CardHeader className="p-0">
              <CardTitle className="text-xl font-bold">Progression des projets</CardTitle>
              <CardDescription className="text-muted-foreground">
                <select className="bg-muted text-muted-foreground rounded px-2 py-1">
                  <option>Dernier mois</option>
                  <option>Ce mois</option>
                  <option>Dernière année</option>
                </select>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <div className="flex justify-between text-muted-foreground text-sm">
                <span>Lun</span>
                <span>Mar</span>
                <span>Mer</span>
                <span>Jeu</span>
                <span>Sam</span>
              </div>
              <div className="h-40 bg-muted rounded mt-2 flex items-center justify-center">
                <p className="text-muted-foreground">[Line Chart Placeholder]</p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="bg-card text-card-foreground shadow-md rounded-lg p-6">
            <CardHeader className="p-0">
              <CardTitle className="text-xl font-bold">Activités récentes</CardTitle>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <div className="flex flex-col space-y-4">
                {isLoading ? (
                  <div>Loading activities...</div>
                ) : latestProjects.length > 0 ? (
                  latestProjects.map((project, index) => (
                    <div
                      key={index}
                      className={`flex items-center p-3 rounded-lg border-l-4 ${getStatusColor(project.state)}`}
                    >
                      <h3 className="text-sm text-card-foreground">{project.nom || "Unnamed Activity"}</h3>
                    </div>
                  ))
                ) : (
                  <div>No activities available</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Section: Pie Chart and Upcoming Tasks */}
        <div className="flex flex-col w-full md:w-[48%] gap-4">
          {/* Pie Chart */}
          <Card className="bg-card text-card-foreground shadow-md rounded-lg p-6">
            <CardHeader className="items-center pb-0">
              <CardTitle className="text-xl font-bold">Répartition département</CardTitle>
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
                                    {totalNombre}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground"
                                  >
                                    Total
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
                        <span className="text-sm font-medium text-muted-foreground">
                          {chartConfig[item.status].label} ({item.nombre}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card className="bg-card text-card-foreground shadow-md rounded-lg p-6">
            <CardHeader className="p-0">
              <CardTitle className="text-xl font-bold">Tâches à venir</CardTitle>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <div className="flex flex-col space-y-4">
                {isLoading ? (
                  <div>Loading tasks...</div>
                ) : latestTasks.length > 0 ? (
                  latestTasks.map((task, index) => (
                    <div
                      key={index}
                      className="flex flex-row justify-between p-3 rounded-lg border-l-4 border-l-chart-1"
                    >
                      <h3 className="text-sm text-card-foreground">{task.nom || "Unnamed Task"}</h3>
                      <span className="text-sm text-muted-foreground">
                        Échéance: {task.echeance || "N/A"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div>No tasks available</div>
                )}
              </div>
              <button className="mt-4 flex items-center gap-2 text-primary hover:underline">
                <PlusCircle className="h-4 w-4" /> Ajouter une tâche
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}