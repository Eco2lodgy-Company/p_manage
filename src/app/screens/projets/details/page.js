"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, CheckCircle, Share2 } from "lucide-react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import TaskStatistics from "../components/TaskStatistics";
import KanbanView from "../components/KanbanView";
import CalendarView from "../components/CalendarView";
import TaskList from "../components/TaskList";

function ProjectDetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [id, setId] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [formData, setFormData] = useState({ email: "" });
  const [errors, setErrors] = useState({});
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

  // Validate form data for sharing
  const validateForm = (data) => {
    const schema = z.object({
      email: z.string().email("Veuillez entrer une adresse email valide").min(1, "L'email est requis"),
    });
    const result = schema.safeParse(data);
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  // Handle sharing project
  const handleShareProject = async () => {
    if (!validateForm(formData)) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }
    const generateKeyWithTimestamp = (length = 32) => {
      const bytes = crypto.randomBytes(length);
      const base64 = bytes.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      return base64 + Date.now().toString();
    };
    const shareData = {
      email: formData.email,
      token: generateKeyWithTimestamp(),
      project_id: id,
    };
    setIsSharing(true);
    try {
      const response = await fetch(`http://alphatek.fr:3110/api/invitations/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shareData),
      });
      if (!response.ok) throw new Error("Erreur de réseau");
      const data = await response.json();
      toast.success(data.message);
      setIsShareOpen(false);
      setFormData({ email: "" });
    } catch (error) {
      console.error("Erreur lors du partage du projet:", error);
      toast.error("Erreur lors du partage du projet");
    } finally {
      setIsSharing(false);
    }
  };

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
    const end = new Date(convertDate(task.start_date) + task.echeance);
    const duration = (end - start) / (1000 * 60 * 60 * 24);
    return {
      name: task.titre || "Tâche",
      start: convertDate(task.start_date),
      end: convertDate(end),
      duration: task.echeance > 0 ? task.echeance : 1,
      status: task.state || "N/A",
    };
  }) : [];

  // PERT chart node positions
  const pertNodes = Array.isArray(tasks) ? tasks.map((task, index) => ({
    id: task.id || 0,
    name: task.titre || "Tâche",
    x: 100 + index * 150,
    y: 100 + (index % 2) * 100,
    start: convertDate(task.start_date),
    duration: task.echeance,
  })) : [];

  // PERT chart edges
  const pertEdges = Array.isArray(tasks) ? tasks.flatMap((task) =>
    Array.isArray(task.dependances) ? task.dependances.map((depId) => {
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
  };

  // Filter tasks based on search term
  const filteredTasks = Array.isArray(tasks) ? tasks.filter((task) =>
    (task.titre?.toLowerCase().includes(searchTerm.toLowerCase()) || task.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col md:ml-64 lg:ml-64 xl:ml-64 items-center justify-center">
        <h1 className="text-2xl font-bold text-sky-700">Chargement...</h1>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col md:ml-64 lg:ml-64 xl:ml-64 items-center justify-center">
        <h1 className="text-2xl font-bold text-sky-700">Projet non trouvé</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:ml-64 lg:ml-64 xl:ml-64">
      <Toaster />
      <div className="fixed top-0 left-0 md:left-64 lg:left-64 xl:left-64 right-0 bg-sky-500 text-white p-4 shadow-md flex justify-between items-center z-10">
        <Button
          variant="outline"
          className="bg-white text-sky-500 hover:bg-sky-100 border-none mr-2"
          onClick={() => router.push("/projets")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Retour
        </Button>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Rechercher une tâche..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-48 text-sm"
          />
          <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-white text-sky-500 hover:bg-sky-100 border-none">
                <Share2 className="h-5 w-5 mr-1" /> Partager
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Invitez</DialogTitle>
                <DialogDescription>Ceci donnera un accès total à ce projet.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="share-email" className="text-right">Email</Label>
                  <div className="col-span-3">
                    <Input
                      id="share-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleShareProject} className="bg-sky-500 hover:bg-sky-600 text-white" disabled={isSharing}>
                  {isSharing ? "Envoi..." : "Partager"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex-1 p-4 mt-16 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 gap-6">
          {/* Project Name and Description at the Top */}
          <Card className="w-full bg-white shadow-md">
            <CardContent className="p-4">
              <h2 className="text-2xl font-bold text-sky-700">{projectData.title}</h2>
              <p className="text-lg text-gray-600 mt-2">{projectData.description}</p>
            </CardContent>
          </Card>

          {/* Task Statistics */}
          <TaskStatistics tasks={tasks} />

          {/* View Tabs */}
          <Card className="w-full bg-white shadow-md border-l-4 border-sky-500">
            <CardContent className="p-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 bg-sky-100 mb-4">
                  <TabsTrigger
                    value="dashboard"
                    className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-sky-700 text-sm"
                  >
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger
                    value="kanban"
                    className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-sky-700 text-sm"
                  >
                    Kanban
                  </TabsTrigger>
                  <TabsTrigger
                    value="calendar"
                    className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-sky-700 text-sm"
                  >
                    Calendrier
                  </TabsTrigger>
                  <TabsTrigger
                    value="gantt"
                    className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-sky-700 text-sm"
                  >
                    Gantt
                  </TabsTrigger>
                  <TabsTrigger
                    value="pert"
                    className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-sky-700 text-sm"
                  >
                    PERT
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="mt-4">
                  <div className="text-center py-8">
                    <h3 className="text-lg font-semibold text-sky-700 mb-2">Vue d'ensemble du projet</h3>
                    <p className="text-gray-600">Consultez les statistiques ci-dessus et la liste des tâches ci-dessous.</p>
                  </div>
                </TabsContent>

                <TabsContent value="kanban" className="mt-4">
                  <KanbanView tasks={filteredTasks} convertDate={convertDate} />
                </TabsContent>

                <TabsContent value="calendar" className="mt-4">
                  <CalendarView tasks={filteredTasks} convertDate={convertDate} />
                </TabsContent>

                <TabsContent value="gantt" className="mt-4">
                  <div className="overflow-x-auto">
                    {ganttData.length > 0 ? (
                      <BarChart
                        width={window.innerWidth * 0.8} // Responsive width
                        height={300}
                        data={ganttData}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" dataKey="duration" />
                        <YAxis type="category" dataKey="name" width={150} />
                        <Tooltip
                          formatter={(value, name, props) => [
                            `${props.payload.start} - ${props.payload.end} (${value || 0} jours)`,
                            props.payload.name,
                          ]}
                        />
                        <Bar dataKey="duration" fill="#0ea5e9" />
                      </BarChart>
                    ) : (
                      <p className="text-gray-600 text-sm">Aucune donnée disponible pour le diagramme de Gantt</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="pert" className="mt-4">
                  <div className="overflow-x-auto">
                    {pertNodes.length > 0 ? (
                      <svg
                        width={window.innerWidth * 0.8} // Responsive width
                        height={400}
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
                              {node.name} ({node.start}, {node.duration}j)
                            </text>
                          </g>
                        ))}
                      </svg>
                    ) : (
                      <p className="text-gray-600 text-sm">Aucune donnée disponible pour le diagramme de PERT</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Task List - Added directly below the tabs card */}
          <TaskList 
            tasks={tasks} 
            filteredTasks={filteredTasks} 
            convertDate={convertDate} 
          />
        </div>
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
