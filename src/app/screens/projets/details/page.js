"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, CheckCircle, Share2 } from "lucide-react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { format, parseISO, isValid } from 'date-fns';

// TaskStatistics Component
const TaskStatistics = ({ tasks }) => {
  const stats = {
    total: tasks.length,
    completed: tasks.filter(task => task.state === 'done').length,
    inProgress: tasks.filter(task => task.state === 'in_progress').length,
    pending: tasks.filter(task => task.state === 'pending' || !task.state).length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total des tâches</p>
              <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xl">📋</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Terminées</p>
              <p className="text-2xl font-bold text-green-800">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xl">✅</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">En cours</p>
              <p className="text-2xl font-bold text-yellow-800">{stats.inProgress}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-xl">⏳</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Taux de completion</p>
              <p className="text-2xl font-bold text-orange-800">{completionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 text-xl">📊</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// KanbanView Component
const KanbanView = ({ tasks, convertDate }) => {
  const getstatename = (state) => {
    switch (state) {
      case "done":
        return "Terminé";
      case "in_progress":
        return "En cours";
      case "pending":
      default:
        return "En attente";
    }
  };

  const columns = [
    {
      id: 'pending',
      title: 'En attente',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      headerColor: 'text-gray-700'
    },
    {
      id: 'in_progress',
      title: 'En cours',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      headerColor: 'text-blue-700'
    },
    {
      id: 'done',
      title: 'Terminé',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      headerColor: 'text-green-700'
    }
  ];

  const getTasksByStatus = (status) => {
    return tasks.filter(task => (task.state || 'pending') === status);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'done':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.id);
        return (
          <Card key={column.id} className={`${column.bgColor} ${column.borderColor} border-l-4`}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-lg font-semibold ${column.headerColor} flex items-center justify-between`}>
                {column.title}
                <span className="bg-white text-gray-600 text-sm px-2 py-1 rounded-full">
                  {columnTasks.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {columnTasks.length > 0 ? columnTasks.map((task) => {
                const startDate = task.start_date ? new Date(task.start_date) : null;
                let endDate = "";
                if (startDate && !isNaN(startDate) && task.echeance) {
                  const end = new Date(startDate);
                  end.setDate(end.getDate() + Number(task.echeance));
                  endDate = convertDate(end);
                }
                
                return (
                  <Card key={task.id} className="bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{task.titre || 'Sans titre'}</h4>
                        <span className={`w-3 h-3 rounded-full ${getStatusColor(task.state)} flex-shrink-0`}></span>
                      </div>
                      {task.description && (
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Échéance: {endDate || 'N/A'}</span>
                        <span className={`px-2 py-1 rounded-full text-white ${getStatusColor(task.state)}`}>
                          {getstatename(task.state)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              }) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">Aucune tâche</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// CalendarView Component
const CalendarView = ({ tasks, convertDate }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const getTasksForDate = (date) => {
    if (!date) return [];
    
    return tasks.filter(task => {
      if (!task.start_date) return false;
      
      const taskDate = new Date(task.start_date);
      if (!isValid(taskDate)) return false;
      
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const getDatesWithTasks = () => {
    const dates = [];
    tasks.forEach(task => {
      if (task.start_date) {
        const taskDate = new Date(task.start_date);
        if (isValid(taskDate)) {
          dates.push(taskDate);
        }
      }
    });
    return dates;
  };

  const tasksForSelectedDate = getTasksForDate(selectedDate);
  const datesWithTasks = getDatesWithTasks();

  const getstatename = (state) => {
    switch (state) {
      case "done":
        return "Terminé";
      case "in_progress":
        return "En cours";
      case "pending":
      default:
        return "En attente";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'done':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-sky-700">
            Calendrier des tâches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{
              hasTask: datesWithTasks
            }}
            modifiersClassNames={{
              hasTask: "bg-sky-100 text-sky-900 font-semibold"
            }}
            className="rounded-md border pointer-events-auto"
          />
          <div className="mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-sky-100 border border-sky-200 rounded"></div>
              <span>Jours avec des tâches</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-sky-700">
            Tâches du {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tasksForSelectedDate.length > 0 ? (
            <div className="space-y-3">
              {tasksForSelectedDate.map((task) => {
                const startDate = task.start_date ? new Date(task.start_date) : null;
                let endDate = "";
                if (startDate && !isNaN(startDate) && task.echeance) {
                  const end = new Date(startDate);
                  end.setDate(end.getDate() + Number(task.echeance));
                  endDate = convertDate(end);
                }

                return (
                  <Card key={task.id} className="bg-gray-50 border border-gray-200">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{task.titre || 'Sans titre'}</h4>
                        <span className={`w-3 h-3 rounded-full ${getStatusColor(task.state)} flex-shrink-0`}></span>
                      </div>
                      {task.description && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Échéance: {endDate || 'N/A'}</span>
                        <span className={`px-2 py-1 rounded-full text-white ${getStatusColor(task.state)}`}>
                          {getstatename(task.state)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Aucune tâche pour cette date</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// TaskList Component
const TaskList = ({ tasks, filteredTasks, convertDate }) => {
  const getstatename = (state) => {
    switch (state) {
      case "done":
        return "Terminé";
      case "in_progress":
        return "En cours";
      case "pending":
      default:
        return "En attente";
    }
  };

  return (
    <Card className="w-full bg-white shadow-md border-l-4 border-sky-500">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-sky-700">
          Liste des tâches ({filteredTasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-sky-50">
                <TableHead className="font-bold text-sky-700 text-sm">Titre</TableHead>
                <TableHead className="font-bold text-sky-700 text-sm">Description</TableHead>
                <TableHead className="font-bold text-sky-700 text-sm">Date de début</TableHead>
                <TableHead className="font-bold text-sky-700 text-sm">Échéance</TableHead>
                <TableHead className="font-bold text-sky-700 text-sm">Statut</TableHead>
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
                    className="hover:bg-sky-50 transition-colors"
                  >
                    <TableCell className="text-sm font-medium">{task.titre || "Sans titre"}</TableCell>
                    <TableCell className="text-sm max-w-xs">
                      <div className="line-clamp-2">{task.description || "Aucune description"}</div>
                    </TableCell>
                    <TableCell className="text-sm">{convertDate(task.start_date) || "N/A"}</TableCell>
                    <TableCell className="text-sm">{endDate || "N/A"}</TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
                          task.state === "done"
                            ? "bg-green-500"
                            : task.state === "in_progress"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                        }`}
                      >
                        {getstatename(task.state)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-600 py-8">
                    Aucune tâche disponible
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

function ProjectDetailsContent() {
  // ... keep existing code (all state variables and useEffect hooks)
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

  useEffect(() => {
    const idFromParams = searchParams.get("id");
    setId(idFromParams);
  }, [searchParams]);

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

  const convertDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d)) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

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

  const pertNodes = Array.isArray(tasks) ? tasks.map((task, index) => ({
    id: task.id || 0,
    name: task.titre || "Tâche",
    x: 100 + index * 150,
    y: 100 + (index % 2) * 100,
    start: convertDate(task.start_date),
    duration: task.echeance,
  })) : [];

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
      {/* ... keep existing code (header section) */}
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
        <div className="grid grid-cols-1 gap-4">
          {/* Project Name and Description */}
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
                <TabsList className="grid w-full grid-cols-4 bg-sky-100 mb-4">
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
                </TabsList>

                <TabsContent value="dashboard" className="mt-4">
                  <div className="text-center py-8">
                    <p className="text-gray-600 text-sm">Tableau de bord - Statistiques affichées ci-dessus</p>
                  </div>
                </TabsContent>

                <TabsContent value="kanban" className="mt-4">
                  <KanbanView tasks={tasks} convertDate={convertDate} />
                </TabsContent>

                <TabsContent value="calendar" className="mt-4">
                  <CalendarView tasks={tasks} convertDate={convertDate} />
                </TabsContent>

                <TabsContent value="gantt" className="mt-4">
                  <div className="overflow-x-auto">
                    {ganttData.length > 0 ? (
                      <BarChart
                        width={window.innerWidth * 0.8}
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
              </Tabs>
            </CardContent>
          </Card>

          {/* Task List */}
          <TaskList tasks={tasks} filteredTasks={filteredTasks} convertDate={convertDate} />
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
