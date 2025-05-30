
"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Calendar, CheckCircle, Clock, AlertCircle, Users, TrendingUp, BarChart3, ArrowLeft, Plus, Edit, Trash2, Share2 } from "lucide-react";
import { Toaster, toast } from "sonner";
import { z } from "zod";
// import { format, parseISO, isValid } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Composants internes
const GanttChart = ({ tasks }) => {
  const sortedTasks = [...tasks].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
  const getStatusInfo = (state) => ({
    'in_progress': { color: 'bg-primary/10 text-primary border-primary/20', icon: Clock },
    'done': { color: 'bg-success/10 text-success border-success/20', icon: CheckCircle },
    'pending': { color: 'bg-warning/10 text-warning border-warning/20', icon: AlertCircle },
  }[state] || { color: 'bg-muted/50 text-muted-foreground border-muted', icon: AlertCircle });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">Diagramme de Gantt</h3>
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="space-y-3">
          {sortedTasks.map((task) => {
            const startDate = new Date(task.start_date);
            const duration = task.echeance || 1;
            const statusInfo = getStatusInfo(task.state);
            return (
              <div key={task.id} className="flex items-center space-x-4">
                <div className="w-32 truncate text-sm font-medium text-foreground">
                  {task.titre}
                </div>
                <div className="flex-1 bg-muted rounded-full h-6 relative">
                  <div
                    className={`h-full rounded-full flex items-center px-2 text-xs font-medium ${
                      task.state === 'done' ? 'bg-success text-success-foreground' :
                      task.state === 'in_progress' ? 'bg-primary text-primary-foreground' :
                      'bg-warning text-warning-foreground'
                    }`}
                    style={{ width: `${Math.max(20, duration * 10)}%` }}
                  >
                    {duration}j
                  </div>
                </div>
                <div className="w-24 text-xs text-muted-foreground">
                  {formatDate(task.start_date)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const PertChart = ({ tasks }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">Diagramme PERT</h3>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex flex-wrap gap-4 justify-center">
          {tasks.map((task) => {
            const statusInfo = getStatusInfo(task.state);
            const Icon = statusInfo.icon;
            return (
              <div key={task.id} className="relative">
                <div className={`w-32 h-20 rounded-lg border-2 ${statusInfo.color} p-3 flex flex-col justify-center items-center`}>
                  <Icon className="w-4 h-4 mb-1" />
                  <div className="text-xs font-medium text-center truncate w-full">
                    {task.titre}
                  </div>
                  <div className="text-xs opacity-75">
                    {task.echeance || 0}j
                  </div>
                </div>
                {task.dependances && task.dependances.length > 0 && (
                  <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {task.dependances.length}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const KanbanBoard = ({ tasks }) => {
  const columns = [
    { key: 'pending', title: 'En attente', color: 'bg-warning/10 border-warning/20' },
    { key: 'in_progress', title: 'En cours', color: 'bg-primary/10 border-primary/20' },
    { key: 'done', title: 'Terminé', color: 'bg-success/10 border-success/20' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">Tableau Kanban</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => {
          const columnTasks = tasks.filter((task) => task.state === column.key);
          return (
            <div key={column.key} className={`bg-card border border-border rounded-lg p-4 ${column.color}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-foreground">{column.title}</h4>
                <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs">
                  {columnTasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {columnTasks.map((task) => (
                  <div key={task.id} className="bg-background border border-border rounded-lg p-3 shadow-sm">
                    <h5 className="font-medium text-foreground mb-1">{task.titre}</h5>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{task.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatDate(task.start_date)}</span>
                      <span>{task.echeance || 0}j</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CalendarView = ({ tasks }) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getTasksForDay = (day) => {
    if (!day) return [];
    const dayDate = new Date(currentYear, currentMonth, day);
    return tasks.filter((task) => {
      const taskDate = new Date(task.start_date);
      return taskDate.toDateString() === dayDate.toDateString();
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">Vue Calendrier</h3>
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-center text-foreground">
            {new Date(currentYear, currentMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </h4>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const dayTasks = getTasksForDay(day);
            return (
              <div key={index} className="min-h-[80px] p-1 border border-border rounded">
                {day && (
                  <>
                    <div className="text-sm font-medium text-foreground mb-1">{day}</div>
                    <div className="space-y-1">
                      {dayTasks.slice(0, 2).map((task) => {
                        const statusInfo = getStatusInfo(task.state);
                        return (
                          <div key={task.id} className={`text-xs p-1 rounded truncate ${statusInfo.color}`}>
                            {task.titre}
                          </div>
                        );
                      })}
                      {dayTasks.length > 2 && (
                        <div className="text-xs text-muted-foreground">+{dayTasks.length - 2}</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function ProjectDetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [id, setId] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('tasks');
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
        if (!response.ok) throw new Error("Erreur de réseau");
        const data = await response.json();
        if (data.data) setProjectData(data.data[0]);
        else toast.error("Projet non trouvé");
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
        if (!response.ok) throw new Error("Erreur de réseau");
        const data = await response.json();
        const tasksArray = Array.isArray(data.data) ? data.data[0] : Array.isArray(data.data[0]) ? data.data[0] : [];
        if (tasksArray.length > 0) setTasks(tasksArray);
        else {
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
      result.error.errors.forEach((err) => (fieldErrors[err.path[0]] = err.message));
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
      return bytes.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") + Date.now().toString();
    };
    const shareData = { email: formData.email, token: generateKeyWithTimestamp(), project_id: id };
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

  const formatDate = (dateString) => {
    if (!dateString) return "Non définie";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const getStatusInfo = (state) => ({
    'in_progress': { label: 'En cours', color: 'bg-primary/10 text-primary border-primary/20', icon: Clock },
    'done': { label: 'Terminé', color: 'bg-success/10 text-success border-success/20', icon: CheckCircle },
    'pending': { label: 'En attente', color: 'bg-warning/10 text-warning border-warning/20', icon: AlertCircle },
  }[state] || { label: 'Non défini', color: 'bg-muted/50 text-muted-foreground border-muted', icon: AlertCircle });

  const projectTasks = useMemo(() => tasks.filter((task) => task.id_projet === id), [tasks, id]);
  const taskStats = useMemo(() => {
    const total = projectTasks.length;
    const done = projectTasks.filter((task) => task.state === 'done').length;
    const inProgress = projectTasks.filter((task) => task.state === 'in_progress').length;
    const pending = projectTasks.filter((task) => task.state === 'pending').length;
    const completion = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, inProgress, pending, completion };
  }, [projectTasks]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <h1 className="text-2xl font-bold text-foreground">Chargement...</h1>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <h1 className="text-2xl font-bold text-foreground">Projet non trouvé</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:ml-64 lg:ml-64 xl:ml-64">
      <div className="max-w-7xl mx-auto">
        <Toaster />
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              onClick={() => router.push("/projets")}
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{projectData.title}</h1>
              <p className="text-muted-foreground mt-1">{projectData.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Rechercher une tâche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 text-sm"
            />
            <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-muted text-foreground hover:bg-muted/80">
                  <Share2 className="w-4 h-4 mr-2" /> Partager
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Invitez</DialogTitle>
                  <DialogDescription>Ceci donnera un accès total à ce projet.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="share-email" className="text-right">
                      Email
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="share-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleShareProject}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isSharing}
                  >
                    {isSharing ? "Envoi..." : "Partager"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Card principale avec tabs */}
        <div className="bg-card border border-border rounded-lg shadow-sm">
          {/* Tabs */}
          <div className="border-b border-border px-6">
            <nav className="flex space-x-8">
              {[
                { key: 'tasks', label: 'Tâches', icon: CheckCircle },
                { key: 'gantt', label: 'GANTT', icon: BarChart3 },
                { key: 'pert', label: 'PERT', icon: TrendingUp },
                { key: 'kanban', label: 'Kanban', icon: Users },
                { key: 'calendar', label: 'Calendrier', icon: Calendar },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                      activeTab === tab.key
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Contenu des tabs */}
          <div className="p-6">
            {activeTab === 'tasks' && (
              <div className="space-y-6">
                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-background border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold text-foreground">{taskStats.total}</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="bg-background border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Terminées</p>
                        <p className="text-2xl font-bold text-success">{taskStats.done}</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-success" />
                    </div>
                  </div>
                  <div className="bg-background border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">En cours</p>
                        <p className="text-2xl font-bold text-primary">{taskStats.inProgress}</p>
                      </div>
                      <Clock className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <div className="bg-background border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Progression</p>
                        <p className="text-2xl font-bold text-foreground">{taskStats.completion}%</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="bg-background border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Progression du projet</span>
                    <span className="text-sm text-muted-foreground">{taskStats.completion}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${taskStats.completion}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'gantt' && <GanttChart tasks={projectTasks} />}
            {activeTab === 'pert' && <PertChart tasks={projectTasks} />}
            {activeTab === 'kanban' && <KanbanBoard tasks={projectTasks} />}
            {activeTab === 'calendar' && <CalendarView tasks={projectTasks} />}
          </div>
        </div>

        {/* Liste des tâches */}
        <div className="mt-8 bg-card border border-border rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Liste des tâches</h2>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <Plus className="w-4 h-4" />
                Nouvelle tâche
              </Button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {projectTasks
                .filter((task) =>
                  task.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  task.description?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((task) => {
                  const statusInfo = getStatusInfo(task.state);
                  const Icon = statusInfo.icon;
                  return (
                    <div key={task.id} className="bg-background border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                            <h3 className="font-semibold text-foreground">{task.titre}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-sm mb-3">{task.description}</p>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <span>Début: {formatDate(task.start_date)}</span>
                            <span>Durée: {task.echeance || 0} jours</span>
                            <span>Assigné à: {task.asign_to || 'Non assigné'}</span>
                            {task.dependances && task.dependances.length > 0 && (
                              <span>Dépendances: {task.dependances.join(', ')}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
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
        <div className="min-h-screen bg-background flex items-center justify-center">
          <h1 className="text-2xl font-bold text-foreground">Chargement des paramètres...</h1>
        </div>
      }
    >
      <ProjectDetailsContent />
    </Suspense>
  );
}
