"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar, CheckCircle, Share2 } from "lucide-react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";

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
      start: start.toString(),
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column: Remaining Project Information */}
          <div className="lg:col-span-1">
            <Card className="w-full border-l-4 border-sky-500 bg-white shadow-md">
              <CardHeader className="p-4">
                <CardTitle className="text-lg font-bold text-sky-700">
                  Informations du Projet
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-600">ID</p>
                    <p className="text-sm text-gray-800">{projectData.id}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">Montant ($)</p>
                    <p className="text-sm text-gray-800">{projectData.amount?.toFixed(2) || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">Statut</p>
                    <p className="text-sm text-gray-800 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      {getstatename(projectData.state) || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">Dates</p>
                    <p className="text-sm text-gray-800">
                      De {convertDate(projectData.start_date)} à {convertDate(projectData.end_date)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Tasks and Visualization */}
          <div className="lg:col-span-2 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-sky-100 mb-4">
                <TabsTrigger
                  value="dashboard"
                  className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-sky-700 text-sm"
                >
                  Dashboard des Tâches
                </TabsTrigger>
                <TabsTrigger
                  value="kanban"
                  className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-sky-700 text-sm"
                >
                  Kanban
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
                <TabsTrigger
                  value="planning"
                  className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-sky-700 text-sm"
                >
                  Planning
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="mt-4">
                <div className="space-y-4">
                  {/* Project Name and Description */}
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-sky-700">{projectData.title}</h2>
                    <p className="text-sm text-gray-600 mt-2">{projectData.description}</p>
                  </div>
                  {/* Task List */}
                  <Card className="w-full bg-white shadow-md border-l-4 border-sky-500">
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg font-bold text-sky-700">Liste des Tâches</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-sky-50">
                              <TableHead className="font-bold text-sky-700 text-xs">Titre</TableHead>
                              <TableHead className="font-bold text-sky-700 text-xs">Description</TableHead>
                              <TableHead className="font-bold text-sky-700 text-xs">Échéance</TableHead>
                              <TableHead className="font-bold text-sky-700 text-xs">Statut</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredTasks.length > 0 ? filteredTasks.map((task) => {
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
                                  <TableCell className="text-xs">{task.titre || ""}</TableCell>
                                  <TableCell className="text-xs line-clamp-2">{task.description || ""}</TableCell>
                                  <TableCell className="text-xs">{endDate || "N/A"}</TableCell>
                                  <TableCell>
                                    <span
                                      className={`px-2 py-1 rounded-full text-white text-xs ${
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
                                </TableRow>
                              );
                            }) : (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center text-gray-600">Aucune tâche disponible</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="kanban" className="mt-4">
                <Card className="w-full bg-white shadow-md border-l-4 border-sky-500">
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg font-bold text-sky-700">Vue Kanban</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-gray-600 text-sm">Vue Kanban non implémentée (à venir).</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="gantt" className="mt-4">
                <Card className="w-full bg-white shadow-md border-l-4 border-sky-500">
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg font-bold text-sky-700">Diagramme de Gantt</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
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
                        <p className="text-gray-600 text-sm">Aucune donnée disponible pour le diagramme de Gantt</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pert" className="mt-4">
                <Card className="w-full bg-white shadow-md border-l-4 border-sky-500">
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg font-bold text-sky-700">Diagramme de PERT</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
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
                        <p className="text-gray-600 text-sm">Aucune donnée disponible pour le diagramme de PERT</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="planning" className="mt-4">
                <Card className="w-full bg-white shadow-md border-l-4 border-sky-500">
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg font-bold text-sky-700">Vue Planning</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-gray-600 text-sm">Vue Planning non implémentée (à venir).</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
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