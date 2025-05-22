"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckCircle } from "lucide-react";
import { Toaster, toast } from "sonner";
import { useRouter } from "next/navigation"; // Use App Router's useRouter

// Component to handle useSearchParams with Suspense
function ProjectDetailsContent() {
  const searchParams = useSearchParams();
  const [id, setId] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [tasks, setTasks] = useState(null);
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
        if (data.data) {
          setTasks(data.data[0]);
          console.log("Données des tâches:", data.data[0]);
        } else {
          toast.error("Tâches non trouvées");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des tâches:", error);
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

  // Convert tasks to Gantt chart data
  const ganttData = tasks &&  tasks.length >0 ? tasks?.map((task) => {
    const start = new Date(task.startDate);
    const end = new Date(task.endDate);
    const duration = (end - start) / (1000 * 60 * 60 * 24); // Days
    return {
      name: task.name,
      start: start.toISOString().split("T")[0],
      duration: duration > 0 ? duration : 1,
      status: task.status,
    };
  }) || [];

  // PERT chart node positions
  const pertNodes = tasks?.map((task, index) => ({
    id: task.id,
    name: task.name,
    x: 100 + index * 150,
    y: 100 + (index % 2) * 100,
  })) || [];

  const pertEdges = projectData.tasks?.flatMap((task) =>
    task.dependencies?.map((depId) => {
      const fromNode = pertNodes.find((n) => n.id === depId);
      const toNode = pertNodes.find((n) => n.id === task.id);
      return { from: fromNode, to: toNode };
    }) || []
  ) || [];

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
                  {projectData.status || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Dates</p>
                <p className="text-lg text-gray-800">
                  {projectData.startDate} - {projectData.endDate}
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
                  {tasks && tasks?.map((task) => (
                    <TableRow
                      key={task.id}
                      className="hover:bg-sky-100 transition-colors"
                    >
                      <TableCell>{task.id}</TableCell>
                      <TableCell>{task.name}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-white text-sm ${
                            task.status === "Terminée"
                              ? "bg-green-500"
                              : task.status === "En Cours"
                              ? "bg-yellow-500"
                              : "bg-orange-500"
                          }`}
                        >
                          {task.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {task.startDate} - {task.endDate}
                      </TableCell>
                    </TableRow>
                  )) || <TableRow><TableCell colSpan={4}>Aucune tâche disponible</TableCell></TableRow>}
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
                        `${props.payload.start} (${value} jours)`,
                        props.payload.name,
                      ]}
                    />
                    <Bar dataKey="duration" fill="#0ea5e9" />
                  </BarChart>
                </div>
              </TabsContent>
              <TabsContent value="pert" className="mt-4">
                <div className="overflow-x-auto">
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
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
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