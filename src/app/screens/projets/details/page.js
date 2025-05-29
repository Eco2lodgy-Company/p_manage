"use client";

import React, { useState, useEffect, Suspense } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, CheckCircle, Share2, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Simuler les paramètres de recherche et les données du projet
const mockSearchParams = { get: (key) => key === "id" ? "1" : null };
const mockRouter = { push: (path) => console.log(`Navigation vers: ${path}`) };
const toast = { 
  success: (msg) => console.log(`✅ Success: ${msg}`), 
  error: (msg) => console.log(`❌ Error: ${msg}`) 
};

// Données de test
const mockProjectData = {
  title: "Projet Alpha",
  description: "Développement d'une application de gestion de projets moderne avec interface utilisateur intuitive"
};

const mockTasks = [
  {
    id: 1,
    titre: "Conception UI/UX",
    description: "Créer les maquettes et prototypes de l'interface utilisateur",
    start_date: "2024-05-20",
    echeance: 7,
    state: "done"
  },
  {
    id: 2,
    titre: "Développement Backend",
    description: "Mise en place de l'API REST et de la base de données",
    start_date: "2024-05-25",
    echeance: 14,
    state: "in_progress"
  },
  {
    id: 3,
    titre: "Développement Frontend",
    description: "Intégration des maquettes et développement des composants React",
    start_date: "2024-05-30",
    echeance: 10,
    state: "pending"
  },
  {
    id: 4,
    titre: "Tests et Débogage",
    description: "Tests unitaires, tests d'intégration et correction des bugs",
    start_date: "2024-06-05",
    echeance: 5,
    state: "pending"
  },
  {
    id: 5,
    titre: "Déploiement",
    description: "Mise en production et configuration serveur",
    start_date: "2024-06-10",
    echeance: 3,
    state: "pending"
  }
];

function ProjectDetailsContent() {
  const searchParams = mockSearchParams;
  const router = mockRouter;
  const [id, setId] = useState("1");
  const [projectData, setProjectData] = useState(mockProjectData);
  const [tasks, setTasks] = useState(mockTasks);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [formData, setFormData] = useState({ email: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // États pour le calendrier
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Fonction pour valider le formulaire
  const validateForm = (data) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newErrors = {};
    
    if (!data.email) {
      newErrors.email = "L'email est requis";
    } else if (!emailRegex.test(data.email)) {
      newErrors.email = "Veuillez entrer une adresse email valide";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gérer le partage du projet
  const handleShareProject = async () => {
    if (!validateForm(formData)) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }
    
    setIsSharing(true);
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Invitation envoyée avec succès");
      setIsShareOpen(false);
      setFormData({ email: "" });
    } catch (error) {
      console.error("Erreur lors du partage du projet:", error);
      toast.error("Erreur lors du partage du projet");
    } finally {
      setIsSharing(false);
    }
  };

  // Convertir une date au format "AAAA-MM-DD"
  const convertDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d)) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Obtenir le nom de l'état
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

  // Filtrer les tâches basé sur le terme de recherche
  const filteredTasks = Array.isArray(tasks) ? tasks.filter((task) =>
    (task.titre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     task.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  // Fonctions pour le calendrier
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getTasksForDate = (date) => {
    const dateStr = convertDate(date);
    return filteredTasks.filter(task => {
      const taskStartDate = convertDate(task.start_date);
      if (taskStartDate === dateStr) return true;
      
      // Vérifier si la date est dans la période de la tâche
      const startDate = new Date(task.start_date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (task.echeance || 0));
      
      return date >= startDate && date <= endDate;
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  // Générer le calendrier
  const generateCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    
    // Jours vides au début
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 p-1"></div>);
    }
    
    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const tasksForDay = getTasksForDate(date);
      const isSelected = selectedDate && 
        selectedDate.toDateString() === date.toDateString();
      
      days.push(
        <div
          key={day}
          className={`h-24 p-1 border border-gray-200 cursor-pointer hover:bg-sky-50 transition-colors ${
            isSelected ? 'bg-sky-100 border-sky-300' : ''
          }`}
          onClick={() => setSelectedDate(date)}
        >
          <div className="text-sm font-medium text-gray-700">{day}</div>
          <div className="mt-1 space-y-1">
            {tasksForDay.slice(0, 2).map(task => (
              <div
                key={task.id}
                className={`text-xs px-1 py-0.5 rounded truncate ${
                  task.state === 'done' 
                    ? 'bg-green-100 text-green-800'
                    : task.state === 'in_progress'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-orange-100 text-orange-800'
                }`}
                title={task.titre}
              >
                {task.titre}
              </div>
            ))}
            {tasksForDay.length > 2 && (
              <div className="text-xs text-gray-500">
                +{tasksForDay.length - 2} autres
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };

  // Données pour le diagramme de Gantt
  const ganttData = Array.isArray(tasks) && tasks.length > 0 ? tasks.map((task) => {
    const start = new Date(task.start_date);
    const duration = task.echeance > 0 ? task.echeance : 1;
    return {
      name: task.titre || "Tâche",
      start: convertDate(task.start_date),
      duration: duration,
      status: task.state || "N/A",
    };
  }) : [];

  // Données pour le diagramme PERT
  const pertNodes = Array.isArray(tasks) ? tasks.map((task, index) => ({
    id: task.id || 0,
    name: task.titre || "Tâche",
    x: 100 + index * 150,
    y: 100 + (index % 2) * 100,
    start: convertDate(task.start_date),
    duration: task.echeance,
  })) : [];

  const pertEdges = [];

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

                {/* Dashboard Tab */}
                <TabsContent value="dashboard" className="mt-4">
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
                              <TableCell className="text-xs">{task.description || ""}</TableCell>
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
                </TabsContent>

                {/* Kanban Tab */}
                <TabsContent value="kanban" className="mt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {[
                      { key: "pending", title: "À faire", color: "bg-orange-50 border-orange-200" },
                      { key: "in_progress", title: "En cours", color: "bg-yellow-50 border-yellow-200" },
                      { key: "done", title: "Terminé", color: "bg-green-50 border-green-200" }
                    ].map((column) => {
                      const columnTasks = filteredTasks.filter(task => task.state === column.key);
                      
                      return (
                        <div key={column.key} className={`${column.color} border-2 rounded-lg p-4 min-h-96`}>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">{column.title}</h3>
                            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm font-medium">
                              {columnTasks.length}
                            </span>
                          </div>
                          <div className="space-y-3">
                            {columnTasks.map((task) => {
                              const startDate = task.start_date ? new Date(task.start_date) : null;
                              let endDate = "";
                              if (startDate && !isNaN(startDate) && task.echeance) {
                                const end = new Date(startDate);
                                end.setDate(end.getDate() + Number(task.echeance));
                                endDate = convertDate(end);
                              }
                              
                              return (
                                <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-medium text-gray-900 text-sm leading-tight">{task.titre}</h4>
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-medium ${
                                        task.state === "done"
                                          ? "bg-green-100 text-green-800"
                                          : task.state === "in_progress"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-orange-100 text-orange-800"
                                      }`}
                                    >
                                      {getstatename(task.state)}
                                    </span>
                                  </div>
                                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">{task.description}</p>
                                  <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>Début: {convertDate(task.start_date)}</span>
                                    <span>Fin: {endDate || "N/A"}</span>
                                  </div>
                                  <div className="mt-2 flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                      Durée: {task.echeance || 0} jour{(task.echeance || 0) > 1 ? 's' : ''}
                                    </span>
                                    <div className="flex items-center space-x-1">
                                      {task.state === "done" && <CheckCircle className="h-4 w-4 text-green-500" />}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            
                            {columnTasks.length === 0 && (
                              <div className="text-center text-gray-500 py-8">
                                <p className="text-sm">Aucune tâche dans cette colonne</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>

                {/* Calendar Tab */}
                <TabsContent value="calendar" className="mt-4">
                  <div className="bg-white rounded-lg shadow-sm border">
                    {/* En-tête du calendrier */}
                    <div className="flex items-center justify-between p-4 border-b">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateMonth(-1)}
                          className="p-2"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentDate(new Date())}
                          className="px-3 py-2 text-sm"
                        >
                          Aujourd'hui
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateMonth(1)}
                          className="p-2"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Jours de la semaine */}
                    <div className="grid grid-cols-7 border-b">
                      {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                        <div key={day} className="p-2 text-center text-sm font-medium text-gray-700 bg-gray-50">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Grille du calendrier */}
                    <div className="grid grid-cols-7">
                      {generateCalendar()}
                    </div>

                    {/* Détails de la date sélectionnée */}
                    {selectedDate && (
                      <div className="p-4 border-t bg-gray-50">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Tâches pour le {selectedDate.toLocaleDateString('fr-FR')}
                        </h4>
                        <div className="space-y-2">
                          {getTasksForDate(selectedDate).map(task => (
                            <div key={task.id} className="flex items-center space-x-2 text-sm">
                              <span
                                className={`w-3 h-3 rounded-full ${
                                  task.state === 'done' 
                                    ? 'bg-green-500'
                                    : task.state === 'in_progress'
                                    ? 'bg-yellow-500'
                                    : 'bg-orange-500'
                                }`}
                              ></span>
                              <span className="text-gray-900">{task.titre}</span>
                              <span className="text-gray-500">({getstatename(task.state)})</span>
                            </div>
                          ))}
                          {getTasksForDate(selectedDate).length === 0 && (
                            <p className="text-gray-500 text-sm">Aucune tâche pour cette date</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Gantt Tab */}
                <TabsContent value="gantt" className="mt-4">
                  <div className="overflow-x-auto">
                    {ganttData.length > 0 ? (
                      <BarChart
                        width={Math.max(800, ganttData.length * 100)}
                        height={300}
                        data={ganttData}
                        layout="horizontal"
                        margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" dataKey="duration" />
                        <YAxis type="category" dataKey="name" width={150} />
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
                </TabsContent>

                {/* PERT Tab */}
                <TabsContent value="pert" className="mt-4">
                  <div className="overflow-x-auto">
                    {pertNodes.length > 0 ? (
                      <svg
                        width={Math.max(800, pertNodes.length * 150)}
                        height={400}
                        className="border rounded"
                      >
                        {pertEdges.map((edge, index) => (
                          <line
                            key={index}
                            x1={edge.from?.x}
                            y1={edge.from?.y}
                            x2={edge.to?.x}
                            y2={edge.to?.y}
                            stroke="#0ea5e9"
                            strokeWidth="2"
                          />
                        ))}
                        {pertNodes.map((node) => (
                          <g key={node.id}>
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r="40"
                              fill="#bfdbfe"
                              stroke="#0ea5e9"
                              strokeWidth="2"
                            />
                            <text
                              x={node.x}
                              y={node.y - 5}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fill="#1e3a8a"
                              fontSize="12"
                              fontWeight="bold"
                            >
                              {node.name.substring(0, 15)}
                            </text>
                            <text
                              x={node.x}
                              y={node.y + 10}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fill="#1e3a8a"
                              fontSize="10"
                            >
                              {node.duration}j
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