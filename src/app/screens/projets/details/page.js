"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar, CheckCircle } from "lucide-react";
import { Toaster, toast } from "sonner";

function ProjectDetailsContent() {
  const searchParams = useSearchParams();
  const [id, setId] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("gantt");
  const [loading, setLoading] = useState(true);

  // Extract ID from searchParams
  useEffect(() => {
    const idFromParams = searchParams.get("id");
    setId(idFromParams);
  }, [searchParams]);

  // Fetch project details and tasks
  useEffect(() => {
    if (!id) return;

    const fetchProjectDetails = async () => {
      try {
        const response = await fetch(`http://alphatek.fr:3110/api/projects/details/?id=${id}`, {
          method: "GET",
        });
        if (!response.ok) {
          throw new Error("Erreur de réseau");
        }
        const data = await response.json();
        if (data.data) {
          setProjectData(data.data[0]);
          console.log("Données du projet:", data.data[0]);
        } else {
          toast.error("Projet non trouvé");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des détails du projet:", error);
        toast.error("Erreur lors de la récupération des détails du projet");
      } finally {
        setLoading(false);
      }
    };

    const fetchProjectTasks = async () => {
      try {
        const response = await fetch(`http://alphatek.fr:3110/api/tasks/forprojects/?id=${id}`, {
          method: "GET",
        });
        if (!response.ok) {
          throw new Error("Erreur de réseau");
        }
        const data = await response.json();
        console.log("Raw tasks API response:", data);
        // Convert data.data to an array if it's not already
        const tasksArray = Array.isArray(data.data) ? data.data : Array.isArray(data.data[0]) ? data.data[0] : [];
        if (tasksArray.length > 0) {
          setTasks(tasksArray);
          console.log("Tasks set:", tasksArray);
        } else {
          setTasks([]);
          toast.error("Tâches non trouvées ou format incorrect");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des tâches:", error);
        setTasks([]);
        toast.error("Erreur lors de la récupération des tâches");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
    fetchProjectTasks();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col md:ml-64 lg:ml-64 xl:ml-64 items-center justify-center">
        <h1 className="text-2xl font-bold text-sky-700">Chargement...</h1>
      </div>
    );
  }

  // If no project data
  if (!projectData) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col md:ml-64 lg:ml-64 xl:ml-64 items-center justify-center">
        <h1 className="text-2xl font-bold text-sky-700">Projet non trouvé</h1>
      </div>
    );
  }
  // Convert a date to "AAAA-MM-DD" format
  const convertDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d)) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Convert tasks to Gantt chart data
  const ganttData = Array.isArray(tasks) && tasks.length > 0 ? tasks.map((task) => {
    const start = new Date(task.start_date);
    const end = new Date(convertDate(task.start_date) + task.echeance); // Assuming duration is in days
    const duration = (end - start) / (1000 * 60 * 60 * 24); // Days
    return {
      name: task.titre || "Tâche",
      start: start.toString(), // Fixed: Use start.toISOString() correctly
      duration: task.echeance > 0 ? task.echeance : 1,
      status: task.state || "N/A",
    };
  }) : [];

  // PERT chart node positions
  const pertNodes = Array.isArray(tasks) ? tasks.map((task, index) => ({
    id: task.id || 0,
    name: task.name || "Tâche",
    x: 100 + index * 150,
    y: 100 + (index % 2) * 100,
  })) : [];

  // PERT chart edges
  const pertEdges = Array.isArray(projectData.tasks) ? projectData.tasks.flatMap((task) =>
    Array.isArray(task.dependencies) ? task.dependencies.map((depId) => {
      const fromNode = pertNodes.find((n) => n.id === depId);
      const toNode = pertNodes.find((n) => n.id === task.id);
      return fromNode && toNode ? { from: fromNode, to: toNode } : null;
    }).filter(Boolean) : []
  ) : [];

const getstatename = (state) => {
  switch (state) {
    case "done":
      return "Terminé";
    case "in_progress":
      return "En cours";
    case "pending":
      return "En attente";
    default:
      return "En attente";
  }
}

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:ml-64 lg:ml-64 xl:ml-64">
      <Toaster />
      <div className="fixed top-0 left-0 md:left-64 lg:left-64 xl:left-64 right-0 bg-sky-500 text-white p-4 shadow-md text-center z-10">
        <h1 className="text-2xl font-bold">Détails du Projet: {projectData.title}</h1>
      </div>
      <div className="flex-1 p-6 mt-16 flex flex-col items-center">
        <Card className="w-full max-w-4xl mb-6 border-l-4 border-sky-500 bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-sky-700">
              Informations du Projet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-600">ID</p>
                <p className="text-lg text-gray-800">{projectData.id}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Titre</p>
                <p className="text-lg text-gray-800">{projectData.title}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Description</p>
                <p className="text-lg text-gray-800">{projectData.description}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Montant ($)</p>
                <p className="text-lg text-gray-800">{projectData.amount?.toFixed(2) || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Statut</p>
                <p className="text-lg text-gray-800 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  {getstatename(projectData.state) || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Dates</p>
                <p className="text-lg text-gray-800">
                  De {convertDate(projectData.start_date)} à {convertDate(projectData.end_date)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full max-w-4xl mb-6 bg-white shadow-md border-l-4 border-sky-500">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-sky-700">Tâches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-sky-50">
                    <TableHead className="font-bold text-sky-700">ID</TableHead>
                    <TableHead className="font-bold text-sky-700">Nom</TableHead>
                    <TableHead className="font-bold text-sky-700">Statut</TableHead>
                    <TableHead className="font-bold text-sky-700">Dates</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(tasks) && tasks.length > 0 ? tasks.map((task) => {
                    // Calcul de la date de fin à partir de la date de début et de l'échéance (nombre de jours)
                    const startDate = task.start_date ? new Date(task.start_date) : null;
                    let endDate = "";
                    if (startDate && !isNaN(startDate) && task.echeance) {
                      const end = new Date(startDate);
                      end.setDate(end.getDate() + Number(task.echeance));
                      endDate = convertDate(end);
                    }
                    return (
                      <TableRow
                        key={task.id}
                        className="hover:bg-sky-100 transition-colors"
                      >
                        <TableCell>{task.id || 0}</TableCell>
                        <TableCell>{task.titre || ""}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-white text-sm ${
                              task.state === "done"
                                ? "bg-green-500"
                                : task.state === "in_progress"
                                ? "bg-yellow-500"
                                : "bg-orange-500"
                            }`}
                          >
                            {getstatename(task.state) || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {convertDate(task.start_date) || ""} - {endDate || ""}
                        </TableCell>
                      </TableRow>
                    );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={4}>Aucune tâche disponible</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full max-w-4xl bg-white shadow-md border-l-4 border-sky-500">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-sky-700">
              Visualisation du Projet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-sky-100">
                <TabsTrigger
                  value="gantt"
                  className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-sky-700"
                >
                  Diagramme de Gantt
                </TabsTrigger>
                <TabsTrigger
                  value="pert"
                  className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-sky-700"
                >
                  Diagramme de PERT
                </TabsTrigger>
              </TabsList>
              <TabsContent value="gantt" className="mt-4">
                <div className="overflow-x-auto">
                  {ganttData.length > 0 ? (
                    <BarChart
                      width={800}
                      height={300}
                      data={ganttData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" dataKey="duration" hide />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip
                        formatter={(value, name, props) => [
                          `${props.payload.start} (${value || 0} jours)`,
                          props.payload.name,
                        ]}
                      />
                      <Bar dataKey="duration" fill="#0ea5e9" />
                    </BarChart>
                  ) : (
                    <p className="text-gray-600">Aucune donnée disponible pour le diagramme de Gantt</p>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="pert" className="mt-4">
                <div className="overflow-x-auto">
                  {pertNodes.length > 0 ? (
                    <svg
                      width="800"
                      height="300"
                      role="img"
                      aria-label="Diagramme de PERT montrant les tâches et leurs dépendances"
                    >
                      <defs>
                        <marker
                          id="arrow"
                          viewBox="0 0 10 10"
                          refX="5"
                          refY="5"
                          markerWidth="6"
                          markerHeight="6"
                          orient="auto-start-reverse"
                        >
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#0ea5e9" />
                        </marker>
                      </defs>
                      {pertEdges.map((edge, index) => (
                        <line
                          key={index}
                          x1={edge.from?.x}
                          y1={edge.from?.y}
                          x2={edge.to?.x}
                          y2={edge.to?.y}
                          stroke="#0ea5e9"
                          strokeWidth="2"
                          markerEnd="url(#arrow)"
                        />
                      ))}
                      {pertNodes.map((node) => (
                        <g key={node.id}>
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r="30"
                            fill="#bfdbfe"
                            stroke="#0ea5e9"
                            strokeWidth="2"
                          />
                          <text
                            x={node.x}
                            y={node.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="#1e3a8a"
                            fontSize="12"
                          >
                            {node.name}
                          </text>
                        </g>
                      ))}
                    </svg>
                  ) : (
                    <p className="text-gray-600">Aucune donnée disponible pour le diagramme de PERT</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProjectDetails() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-100 flex flex-col md:ml-64 lg:ml-64 xl:ml-64 items-center justify-center">
          <h1 className="text-2xl font-bold text-sky-700">Chargement des paramètres...</h1>
        </div>
      }
    >
      <ProjectDetailsContent />
    </Suspense>
  );
}