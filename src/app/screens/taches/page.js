"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Calendar as CalendarIcon, Trash2, Edit, Eye, ChevronDown } from "lucide-react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Calendar from "react-calendar";
import Draggable from "react-draggable";
import { z } from "zod";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Assuming a tooltip component

// Define Zod schema for task validation
const taskSchema = z.object({
  titre: z.string().min(1, "Le titre est requis").max(100, "Le titre ne doit pas dépasser 100 caractères"),
  description: z.string().min(1, "La description est requise").max(500, "La description ne doit pas dépasser 500 caractères"),
  id_projet: z.string().optional(),
  start_date: z.string().optional().refine(
    (val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val),
    "La date de début doit être au format YYYY-MM-DD"
  ),
  echeance: z.string().optional().refine(
    (val) => !val || /^\d+$/.test(val),
    "L'échéance doit être un nombre positif"
  ),
  precedence: z.enum(["1", "2", "3"], {
    errorMap: () => ({ message: "La précédence doit être '1', '2' ou '3'" }),
  }).optional(),
  asign_to: z.string().optional(),
});

// Static fallback data
const staticTasks = [
  {
    id: 1,
    titre: "Plan réunion",
    description: "Préparer l'agenda et les notes pour la réunion de l'équipe.",
    id_projet: "1",
    start_date: "2025-05-29",
    echeance: "2",
    precedence: "1",
    asign_to: "1",
    state: "pending",
  },
  {
    id: 2,
    titre: "Développer API",
    description: "Implémenter les endpoints pour l'API de gestion des tâches.",
    id_projet: "2",
    start_date: "2025-05-28",
    echeance: "3",
    precedence: "2",
    asign_to: "2",
    state: "in_progress",
  },
  {
    id: 3,
    titre: "Tester application",
    description: "Effectuer les tests unitaires et d'intégration.",
    id_projet: "3",
    start_date: "2025-05-27",
    echeance: "1",
    precedence: "3",
    asign_to: "3",
    state: "done",
  },
];

const Tasks = () => {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    id_projet: "",
    start_date: "",
    echeance: "",
    precedence: "1",
    asign_to: "",
  });
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const response = await fetch(`http://alphatek.fr:3110/api/tasks/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Erreur de réseau");
      const data = await response.json();
      const tasksArray = Array.isArray(data.data) ? data.data : [];
      if (tasksArray.length > 0) {
        setTasks(tasksArray);
        setFilteredTasks(tasksArray);
      } else {
        setTasks(staticTasks);
        setFilteredTasks(staticTasks);
        toast.warning("Aucune tâche récupérée, données statiques affichées.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des tâches:", error);
      setTasks(staticTasks);
      setFilteredTasks(staticTasks);
      toast.error("Erreur lors de la récupération des tâches, données statiques affichées.");
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await fetch(`http://alphatek.fr:3110/api/users/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Erreur de réseau");
      const data = await response.json();
      const usersArray = Array.isArray(data.data) ? data.data : [];
      setUsers(usersArray.length > 0 ? usersArray : []);
      if (usersArray.length === 0) toast.error("Aucun utilisateur trouvé.");
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      setUsers([]);
      toast.error("Erreur lors de la récupération des utilisateurs");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchTasks();
      await fetchUsers();
      setLoading(false);
    };
    loadData();
  }, []);

  // Validate form data
  const validateForm = (data) => {
    const result = taskSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0];
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  // Add task
  const handleAddTask = async () => {
    if (!validateForm(formData)) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }
    const newTask = {
      titre: formData.titre,
      description: formData.description,
      id_projet: formData.id_projet || undefined,
      start_date: formData.start_date || undefined,
      echeance: formData.echeance || undefined,
      precedence: formData.precedence || undefined,
      asign_to: formData.asign_to || undefined,
    };
    try {
      const response = await fetch(`http://alphatek.fr:3110/api/tasks/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      if (!response.ok) throw new Error("Erreur de réseau");
      const data = await response.json();
      setTasks(data.data);
      toast.success("Tâche ajoutée avec succès !");
      setFormData({
        titre: "",
        description: "",
        id_projet: "",
        start_date: "",
        echeance: "",
        precedence: "1",
        asign_to: "",
      });
      setIsAddOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la tâche:", error);
      toast.error("Erreur lors de l'ajout de la tâche");
    }
  };

  // Edit task
  const handleEditTask = async () => {
    if (!validateForm(formData)) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }
    const taskToEdit = {
      id: formData.id,
      titre: formData.titre,
      description: formData.description,
      id_projet: formData.id_projet || undefined,
      start_date: formData.start_date || undefined,
      echeance: formData.echeance || undefined,
      precedence: formData.precedence || undefined,
      asign_to: formData.asign_to || undefined,
    };
    try {
      const response = await fetch(`http://alphatek.fr:3110/api/tasks/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskToEdit),
      });
      if (!response.ok) throw new Error("Erreur de réseau");
      const data = await response.json();
      toast.success(data.message);
      await fetchTasks();
      setIsEditOpen(false);
      setFormData({
        titre: "",
        description: "",
        id_projet: "",
        start_date: "",
        echeance: "",
        precedence: "1",
        asign_to: "",
      });
      setSelectedTask(null);
    } catch (error) {
      console.error("Erreur lors de la modification de la tâche:", error);
      toast.error("Erreur lors de la modification de la tâche");
    }
  };

  // Delete task
  const handleDeleteTask = async () => {
    const taskToDelete = { id: selectedTask.id };
    try {
      const response = await fetch(`http://alphatek.fr:3110/api/tasks/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskToDelete),
      });
      if (!response.ok) throw new Error("Erreur de réseau");
      const data = await response.json();
      toast.success(data.message);
      await fetchTasks();
      setIsDeleteOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Erreur lors de la suppression de la tâche:", error);
      toast.error("Erreur lors de la suppression de la tâche");
    }
  };

  // Open edit modal
  const openEditModal = (task) => {
    setSelectedTask(task);
    setFormData({
      id: task.id,
      titre: task.titre,
      description: task.description,
      id_projet: task.id_projet || "",
      start_date: task.start_date || "",
      echeance: task.echeance || "",
      precedence: task.precedence || "1",
      asign_to: task.asign_to || "",
    });
    setErrors({});
    setIsEditOpen(true);
  };

  // Open view modal
  const openViewModal = (task) => {
    setSelectedTask(task);
    setIsViewOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (task) => {
    setSelectedTask(task);
    setIsDeleteOpen(true);
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

  // Get status name in French
  const getStatusName = (state) => {
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

  // Filter and search tasks
  useEffect(() => {
    let updatedTasks = [...tasks];
    if (searchTerm) {
      updatedTasks = updatedTasks.filter(
        (task) =>
          task.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      updatedTasks = updatedTasks.filter((task) => task.state === statusFilter);
    }
    setFilteredTasks(updatedTasks);
  }, [searchTerm, statusFilter, tasks]);

  // Kanban drag-and-drop handler
  const handleKanbanDrop = (taskId, newStatus) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, state: newStatus } : task
    );
    setTasks(updatedTasks);
    setFilteredTasks(updatedTasks);
    toast.success(`Tâche déplacée vers ${getStatusName(newStatus)}`);
  };

  // PERT Diagram Rendering
  const renderPertDiagram = () => {
    const nodes = filteredTasks.map((task, index) => ({
      id: task.id,
      x: 150 + index * 200,
      y: 100 + (parseInt(task.precedence) - 1) * 150,
      label: task.titre,
    }));
    const edges = [];
    filteredTasks.forEach((task, index) => {
      if (index < filteredTasks.length - 1) {
        const nextTask = filteredTasks[index + 1];
        if (parseInt(task.precedence) <= parseInt(nextTask.precedence)) {
          edges.push({ from: task.id, to: nextTask.id });
        }
      }
    });
    return (
      <svg width="100%" height="500" className="transition-all duration-300">
        {nodes.map((node) => (
          <g key={node.id} className="transition-all duration-300">
            <circle
              cx={node.x}
              cy={node.y}
              r="40"
              fill="linear-gradient(135deg, #4B5EAA, #8A9BFF)"
              stroke="var(--border-accent)"
              strokeWidth="2"
            />
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dy=".3em"
              style={{ fill: "#FFFFFF", fontSize: "14px", fontWeight: "bold" }}
            >
              {node.label}
            </text>
          </g>
        ))}
        {edges.map((edge, idx) => {
          const fromNode = nodes.find((n) => n.id === edge.from);
          const toNode = nodes.find((n) => n.id === edge.to);
          return (
            <line
              key={idx}
              x1={fromNode.x + 40}
              y1={fromNode.y}
              x2={toNode.x - 40}
              y2={toNode.y}
              stroke="var(--border-accent)"
              strokeWidth="3"
              markerEnd="url(#arrow)"
            />
          );
        })}
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="var(--border-accent)" />
          </marker>
        </defs>
      </svg>
    );
  };

  // Gantt Chart Rendering
  const renderGanttChart = () => {
    const startDate = new Date(Math.min(...filteredTasks.map((t) => new Date(t.start_date))));
    const endDate = new Date(
      Math.max(...filteredTasks.map((t) => new Date(t.start_date).setDate(new Date(t.start_date).getDate() + Number(t.echeance))))
    );
    const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
    const pixelsPerDay = 800 / (totalDays || 1);

    return (
      <div className="transition-all duration-300">
        <div className="flex overflow-x-auto">
          {Array.from({ length: totalDays + 1 }).map((_, idx) => {
            const date = new Date(startDate);
            date.setDate(date.getDate() + idx);
            return (
              <div
                key={idx}
                style={{
                  width: `${pixelsPerDay}px`,
                  textAlign: "center",
                  color: "var(--body-text)",
                  fontSize: "12px",
                  padding: "5px",
                }}
              >
                {date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </div>
            );
          })}
        </div>
        <svg width="100%" height={filteredTasks.length * 60 + 30} className="transition-all duration-300">
          {filteredTasks.map((task, idx) => {
            const taskStart = new Date(task.start_date);
            const taskEnd = new Date(taskStart);
            taskEnd.setDate(taskStart.getDate() + Number(task.echeance));
            const startOffset = (taskStart - startDate) / (1000 * 60 * 60 * 24);
            const duration = (taskEnd - taskStart) / (1000 * 60 * 60 * 24);
            return (
              <g key={task.id}>
                <rect
                  x={startOffset * pixelsPerDay}
                  y={idx * 60 + 20}
                  width={duration * pixelsPerDay || 10}
                  height="40"
                  rx="8"
                  fill={
                    task.state === "done"
                      ? "linear-gradient(135deg, #4CAF50, #81C784)"
                      : task.state === "in_progress"
                      ? "linear-gradient(135deg, #FFCA28, #FFD54F)"
                      : "linear-gradient(135deg, #F44336, #EF9A9A)"
                  }
                  style={{ filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))" }}
                />
                <text
                  x={startOffset * pixelsPerDay + 10}
                  y={idx * 60 + 40}
                  style={{ fill: "#FFFFFF", fontSize: "14px", fontWeight: "500" }}
                >
                  {task.titre}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col md:ml-64 items-center justify-center"
        style={{ backgroundColor: "var(--primary-bg)" }}
      >
        <h1
          className="animate-pulse"
          style={{ color: "var(--title-text)", fontWeight: "bold", fontSize: "1.5rem" }}
        >
          Chargement...
        </h1>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex">
        {/* Sidebar */}
        <div
          className={`fixed top-16 left-0 h-[calc(100vh-64px)] p-4 transition-all duration-300 ${
            sidebarOpen ? "w-64" : "w-16"
          }`}
          style={{
            backgroundColor: "linear-gradient(135deg, #4B5EAA, #8A9BFF)",
            color: "#FFFFFF",
            boxShadow: "4px 0 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mb-4"
            style={{ color: "#FFFFFF" }}
          >
            <ChevronDown
              className={`h-6 w-6 transition-transform ${sidebarOpen ? "rotate-180" : ""}`}
            />
          </Button>
          {sidebarOpen && (
            <div className="space-y-2">
              <div className="relative w-full">
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    color: "#FFFFFF",
                    border: "none",
                  }}
                />
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                  style={{ color: "#FFFFFF" }}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger
                  className="w-full"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    color: "#FFFFFF",
                    border: "none",
                  }}
                >
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    color: "#FFFFFF",
                  }}
                >
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="done">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div
          className="flex-1 ml-16 md:ml-64 min-h-screen flex flex-col transition-all duration-300"
          style={{ backgroundColor: "var(--primary-bg)", padding: "20px" }}
        >
          <Toaster />
          {/* Header */}
          <div
            className="fixed top-0 left-16 md:left-64 right-0 p-4 shadow-md flex justify-between items-center z-10 rounded-lg"
            style={{
              background: "linear-gradient(135deg, #4B5EAA, #8A9BFF)",
              color: "#FFFFFF",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Button
              className="rounded-full"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "#FFFFFF",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.3)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)")}
              onClick={() => router.push("/dashboard")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Retour
            </Button>
            <h1
              className="text-2xl font-bold"
              style={{ color: "#FFFFFF" }}
            >
              Gestion des Tâches
            </h1>
            <DialogTrigger asChild>
              <Button
                className="rounded-full"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  color: "#FFFFFF",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.3)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)")}
              >
                Ajouter une Tâche
              </Button>
            </DialogTrigger>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-4 mt-20 max-w-7xl mx-auto w-full">
            {/* Tabs */}
            <div className="mb-6">
              <div className="flex space-x-2">
                {["table", "calendar", "kanban", "pert", "gantt"].map((mode) => (
                  <Button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className="rounded-full px-4 py-2 transition-all duration-300"
                    style={{
                      background: viewMode === mode ? "linear-gradient(135deg, #4B5EAA, #8A9BFF)" : "var(--tabs-bg)",
                      color: viewMode === mode ? "#FFFFFF" : "var(--body-text-dark)",
                      boxShadow: viewMode === mode ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        viewMode === mode ? "linear-gradient(135deg, #4B5EAA, #8A9BFF)" : "var(--tabs-bg)")
                    }
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Views */}
            {viewMode === "table" && (
              <div
                className="p-6 rounded-xl shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #FFFFFF, #F5F7FA)",
                  transition: "all 0.3s ease",
                }}
              >
                <h2
                  className="text-xl font-semibold mb-4"
                  style={{ color: "var(--title-text)" }}
                >
                  Liste des Tâches
                </h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow
                        style={{ background: "linear-gradient(135deg, #E0E7FF, #D1E9FF)" }}
                      >
                        <TableHead
                          className="font-bold text-sm"
                          style={{ color: "#4B5EAA" }}
                        >
                          Titre
                        </TableHead>
                        <TableHead
                          className="font-bold text-sm"
                          style={{ color: "#4B5EAA" }}
                        >
                          Description
                        </TableHead>
                        <TableHead
                          className="font-bold text-sm"
                          style={{ color: "#4B5EAA" }}
                        >
                          Projet
                        </TableHead>
                        <TableHead
                          className="font-bold text-sm"
                          style={{ color: "#4B5EAA" }}
                        >
                          Date de début
                        </TableHead>
                        <TableHead
                          className="font-bold text-sm"
                          style={{ color: "#4B5EAA" }}
                        >
                          Échéance
                        </TableHead>
                        <TableHead
                          className="font-bold text-sm"
                          style={{ color: "#4B5EAA" }}
                        >
                          Précédence
                        </TableHead>
                        <TableHead
                          className="font-bold text-sm"
                          style={{ color: "#4B5EAA" }}
                        >
                          Assignée à
                        </TableHead>
                        <TableHead
                          className="font-bold text-sm"
                          style={{ color: "#4B5EAA" }}
                        >
                          Statut
                        </TableHead>
                        <TableHead
                          className="font-bold text-sm"
                          style={{ color: "#4B5EAA" }}
                        >
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTasks.length > 0 ? (
                        filteredTasks.map((task) => {
                          const startDate = task.start_date ? new Date(task.start_date) : null;
                          let endDate = "";
                          if (startDate && !isNaN(startDate) && task.echeance) {
                            const end = new Date(startDate);
                            end.setDate(startDate.getDate() + Number(task.echeance));
                            endDate = convertDate(end);
                          }
                          return (
                            <TableRow
                              key={task.id}
                              className="hover:bg-gray-50 transition-all duration-200"
                              style={{ borderRadius: "8px" }}
                            >
                              <TableCell
                                className="text-sm"
                                style={{ color: "var(--body-text-dark)" }}
                              >
                                {task.titre || ""}
                              </TableCell>
                              <TableCell
                                className="text-sm line-clamp-2"
                                style={{ color: "var(--body-text)" }}
                              >
                                {task.description || ""}
                              </TableCell>
                              <TableCell
                                className="text-sm"
                                style={{ color: "var(--body-text)" }}
                              >
                                {task.id_projet || "aucun"}
                              </TableCell>
                              <TableCell
                                className="text-sm"
                                style={{ color: "var(--body-text)" }}
                              >
                                {task.start_date || "-"}
                              </TableCell>
                              <TableCell
                                className="text-sm"
                                style={{ color: "var(--body-text)" }}
                              >
                                {endDate || "N/A"}
                              </TableCell>
                              <TableCell
                                className="text-sm"
                                style={{ color: "var(--body-text)" }}
                              >
                                {task.precedence || "-"}
                              </TableCell>
                              <TableCell
                                className="text-sm"
                                style={{ color: "var(--body-text)" }}
                              >
                                {users.find(u => u.id === task.asign_to)?.nom || "-"}
                              </TableCell>
                              <TableCell>
                                <span
                                  className="px-3 py-1 rounded-full text-sm font-medium"
                                  style={{
                                    color: "#FFFFFF",
                                    background:
                                      task.state === "done"
                                        ? "linear-gradient(135deg, #4CAF50, #81C784)"
                                        : task.state === "in_progress"
                                        ? "linear-gradient(135deg, #FFCA28, #FFD54F)"
                                        : "linear-gradient(135deg, #F44336, #EF9A9A)",
                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                  }}
                                >
                                  {getStatusName(task.state) || "N/A"}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => openViewModal(task)}
                                        className="h-10 w-10 rounded-full"
                                        style={{
                                          color: "#4B5EAA",
                                          borderColor: "#4B5EAA",
                                          transition: "all 0.3s ease",
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                                      >
                                        <Eye className="h-5 w-5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Voir</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => openEditModal(task)}
                                        className="h-10 w-10 rounded-full"
                                        style={{
                                          color: "#4B5EAA",
                                          borderColor: "#4B5EAA",
                                          transition: "all 0.3s ease",
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                                      >
                                        <Edit className="h-5 w-5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Modifier</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => openDeleteModal(task)}
                                        className="h-10 w-10 rounded-full"
                                        style={{
                                          color: "#F44336",
                                          borderColor: "#F44336",
                                          transition: "all 0.3s ease",
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                                      >
                                        <Trash2 className="h-5 w-5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Supprimer</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={9}
                            className="text-center"
                            style={{ color: "var(--body-text)", fontSize: "16px" }}
                          >
                            Aucune tâche disponible
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {viewMode === "calendar" && (
              <div
                className="p-6 rounded-xl shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #FFFFFF, #F5F7FA)",
                  transition: "all 0.3s ease",
                }}
              >
                <h2
                  className="text-xl font-semibold mb-4"
                  style={{ color: "var(--title-text)" }}
                >
                  Vue Calendrier
                </h2>
                <Calendar
                  className="border-none rounded-lg shadow-md"
                  style={{ background: "linear-gradient(135deg, #E0E7FF, #D1E9FF)" }}
                  tileClassName={({ date, view }) =>
                    view === "month" && filteredTasks.some((task) => {
                      const taskDate = new Date(task.start_date);
                      return taskDate.toDateString() === date.toDateString();
                    })
                      ? "bg-yellow-200 text-white rounded-full"
                      : ""
                  }
                  tileContent={({ date, view }) =>
                    view === "month" && filteredTasks.some((task) => {
                      const taskDate = new Date(task.start_date);
                      return taskDate.toDateString() === date.toDateString();
                    }) ? (
                      <div
                        className="text-xs rounded-full w-5 h-5 flex items-center justify-center"
                        style={{
                          backgroundColor: "var(--accent-yellow)",
                          color: "#FFFFFF",
                        }}
                      >
                        {filteredTasks.filter((task) => {
                          const taskDate = new Date(task.start_date);
                          return taskDate.toDateString() === date.toDateString();
                        }).length}
                      </div>
                    ) : null
                  }
                />
              </div>
            )}

            {viewMode === "kanban" && (
              <div
                className="p-6 rounded-xl shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #FFFFFF, #F5F7FA)",
                  transition: "all 0.3s ease",
                }}
              >
                <h2
                  className="text-xl font-semibold mb-4"
                  style={{ color: "var(--title-text)" }}
                >
                  Vue Kanban
                </h2>
                <div className="flex gap-4 overflow-x-auto">
                  {["pending", "in_progress", "done"].map((status) => (
                    <div
                      key={status}
                      className="flex-1 min-w-[300px] p-4 rounded-lg"
                      style={{
                        background: "linear-gradient(135deg, #E0E7FF, #D1E9FF)",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleKanbanDrop(null, status)}
                    >
                      <h3
                        className="text-md font-semibold mb-3"
                        style={{ color: "#4B5EAA" }}
                      >
                        {getStatusName(status)}
                      </h3>
                      {filteredTasks
                        .filter((task) => task.state === status)
                        .map((task) => (
                          <Draggable key={task.id}>
                            <div
                              className="p-3 mb-3 rounded-lg shadow-md cursor-move"
                              style={{
                                background: "linear-gradient(135deg, #FFFFFF, #F0F4F8)",
                                transition: "all 0.3s ease",
                              }}
                              draggable
                              onDragEnd={() => handleKanbanDrop(task.id, status)}
                            >
                              <p
                                className="font-medium"
                                style={{ color: "var(--body-text-dark)" }}
                              >
                                {task.titre}
                              </p>
                              <p
                                className="text-xs mt-1"
                                style={{ color: "var(--body-text)" }}
                              >
                                {task.description}
                              </p>
                              <div className="flex gap-2 mt-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => openViewModal(task)}
                                      className="h-8 w-8 rounded-full"
                                      style={{ color: "#4B5EAA", borderColor: "#4B5EAA" }}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Voir</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => openEditModal(task)}
                                      className="h-8 w-8 rounded-full"
                                      style={{ color: "#4B5EAA", borderColor: "#4B5EAA" }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Modifier</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => openDeleteModal(task)}
                                      className="h-8 w-8 rounded-full"
                                      style={{ color: "#F44336", borderColor: "#F44336" }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Supprimer</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                          </Draggable>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewMode === "pert" && (
              <div
                className="p-6 rounded-xl shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #FFFFFF, #F5F7FA)",
                  transition: "all 0.3s ease",
                }}
              >
                <h2
                  className="text-xl font-semibold mb-4"
                  style={{ color: "var(--title-text)" }}
                >
                  Vue PERT
                </h2>
                {filteredTasks.length > 0 ? (
                  renderPertDiagram()
                ) : (
                  <p style={{ color: "var(--body-text)", fontSize: "16px" }}>Aucune tâche disponible</p>
                )}
              </div>
            )}

            {viewMode === "gantt" && (
              <div
                className="p-6 rounded-xl shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #FFFFFF, #F5F7FA)",
                  transition: "all 0.3s ease",
                }}
              >
                <h2
                  className="text-xl font-semibold mb-4"
                  style={{ color: "var(--title-text)" }}
                >
                  Vue Gantt
                </h2>
                {filteredTasks.length > 0 ? (
                  renderGanttChart()
                ) : (
                  <p style={{ color: "var(--body-text)", fontSize: "16px" }}>Aucune tâche disponible</p>
                )}
              </div>
            )}
          </div>

          {/* Floating Action Button */}
          <DialogTrigger asChild>
            <Button
              className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg"
              style={{
                background: "linear-gradient(135deg, #4B5EAA, #8A9BFF)",
                color: "#FFFFFF",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </Button>
          </DialogTrigger>

          {/* View Dialog */}
          <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
            <DialogContent className="sm:max-w-[500px] rounded-xl">
              <DialogHeader>
                <DialogTitle
                  className="text-2xl font-bold"
                  style={{ color: "#4B5EAA" }}
                >
                  Détails de la Tâche
                </DialogTitle>
                <DialogDescription
                  className="text-md"
                  style={{ color: "var(--body-text)" }}
                >
                  Informations complètes sur la tâche sélectionnée.
                </DialogDescription>
              </DialogHeader>
              {selectedTask && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      className="text-right font-semibold"
                      style={{ color: "#4B5EAA" }}
                    >
                      ID
                    </Label>
                    <span
                      className="col-span-3"
                      style={{ color: "var(--body-text)" }}
                    >
                      {selectedTask.id}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      className="text-right font-semibold"
                      style={{ color: "#4B5EAA" }}
                    >
                      Titre
                    </Label>
                    <span
                      className="col-span-3"
                      style={{ color: "var(--body-text)" }}
                    >
                      {selectedTask.titre}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      className="text-right font-semibold"
                      style={{ color: "#4B5EAA" }}
                    >
                      Description
                    </Label>
                    <span
                      className="col-span-3"
                      style={{ color: "var(--body-text)" }}
                    >
                      {selectedTask.description}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      className="text-right font-semibold"
                      style={{ color: "#4B5EAA" }}
                    >
                      Projet
                    </Label>
                    <span
                      className="col-span-3"
                      style={{ color: "var(--body-text)" }}
                    >
                      {selectedTask.id_projet || "aucun"}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      className="text-right font-semibold"
                      style={{ color: "#4B5EAA" }}
                    >
                      Date de début
                    </Label>
                    <span
                      className="col-span-3"
                      style={{ color: "var(--body-text)" }}
                    >
                      {selectedTask.start_date || "-"}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      className="text-right font-semibold"
                      style={{ color: "#4B5EAA" }}
                    >
                      Échéance
                    </Label>
                    <span
                      className="col-span-3"
                      style={{ color: "var(--body-text)" }}
                    >
                      {selectedTask.echeance || "0"}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      className="text-right font-semibold"
                      style={{ color: "#4B5EAA" }}
                    >
                      Précédence
                    </Label>
                    <span
                      className="col-span-3"
                      style={{ color: "var(--body-text)" }}
                    >
                      {selectedTask.precedence || "-"}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      className="text-right font-semibold"
                      style={{ color: "#4B5EAA" }}
                    >
                      Assignée à
                    </Label>
                    <span
                      className="col-span-3"
                      style={{ color: "var(--body-text)" }}
                    >
                      {users.find(u => u.id === selectedTask.asign_to)?.nom || "-"}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      className="text-right font-semibold"
                      style={{ color: "#4B5EAA" }}
                    >
                      Statut
                    </Label>
                    <span
                      className="col-span-3"
                      style={{ color: "var(--body-text)" }}
                    >
                      {getStatusName(selectedTask.state) || "N/A"}
                    </span>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button
                  onClick={() => setIsViewOpen(false)}
                  className="rounded-full px-6 py-2"
                  style={{
                    background: "linear-gradient(135deg, #4B5EAA, #8A9BFF)",
                    color: "#FFFFFF",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "linear-gradient(135deg, #3A4E89, #6F87E0)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "linear-gradient(135deg, #4B5EAA, #8A9BFF)")}
                >
                  Fermer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="sm:max-w-[500px] rounded-xl">
              <DialogHeader>
                <DialogTitle
                  className="text-2xl font-bold"
                  style={{ color: "#4B5EAA" }}
                >
                  Modifier la Tâche
                </DialogTitle>
                <DialogDescription
                  className="text-md"
                  style={{ color: "var(--body-text)" }}
                >
                  Mettez à jour les détails de la tâche.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="edit-titre"
                    className="text-right font-semibold"
                    style={{ color: "#4B5EAA" }}
                  >
                    Titre
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="edit-titre"
                      value={formData.titre}
                      onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                      className={`rounded-lg ${errors.titre ? "border-red-500" : ""}`}
                      style={{ color: "var(--body-text-dark)", borderColor: "#D1D5DB" }}
                    />
                    {errors.titre && <p className="text-red-500 text-sm mt-1">{errors.titre}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="edit-description"
                    className="text-right font-semibold"
                    style={{ color: "#4B5EAA" }}
                  >
                    Description
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={`rounded-lg ${errors.description ? "border-red-500" : ""}`}
                      style={{ color: "var(--body-text-dark)", borderColor: "#D1D5DB" }}
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="edit-id_projet"
                    className="text-right font-semibold"
                    style={{ color: "#4B5EAA" }}
                  >
                    Projet
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="edit-id_projet"
                      value={formData.id_projet}
                      onChange={(e) => setFormData({ ...formData, id_projet: e.target.value })}
                      className={`rounded-lg ${errors.id_projet ? "border-red-500" : ""}`}
                      style={{ color: "var(--body-text-dark)", borderColor: "#D1D5DB" }}
                    />
                    {errors.id_projet && <p className="text-red-500 text-sm mt-1">{errors.id_projet}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="edit-start_date"
                    className="text-right font-semibold"
                    style={{ color: "#4B5EAA" }}
                  >
                    Date de début
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="edit-start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className={`rounded-lg ${errors.start_date ? "border-red-500" : ""}`}
                      style={{ color: "var(--body-text-dark)", borderColor: "#D1D5DB" }}
                    />
                    {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="edit-echeance"
                    className="text-right font-semibold"
                    style={{ color: "#4B5EAA" }}
                  >
                    Échéance
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="edit-echeance"
                      type="number"
                      value={formData.echeance}
                      onChange={(e) => setFormData({ ...formData, echeance: e.target.value })}
                      className={`rounded-lg ${errors.echeance ? "border-red-500" : ""}`}
                      style={{ color: "var(--body-text-dark)", borderColor: "#D1D5DB" }}
                    />
                    {errors.echeance && <p className="text-red-500 text-sm mt-1">{errors.echeance}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="edit-precedence"
                    className="text-right font-semibold"
                    style={{ color: "#4B5EAA" }}
                  >
                    Précédence
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={formData.precedence}
                      onValueChange={(value) => setFormData({ ...formData, precedence: value })}
                      className="rounded-lg"
                      style={{ backgroundColor: "#F9FAFB", borderColor: "#D1D5DB" }}
                    >
                      <SelectTrigger
                        className="w-full"
                        style={{ color: "var(--body-text-dark)" }}
                      >
                        <SelectValue placeholder="Choisir une précédence" />
                      </SelectTrigger>
                      <SelectContent
                        style={{
                          backgroundColor: "#FFFFFF",
                          color: "var(--body-text-dark)",
                        }}
                      >
                        <SelectItem value="1">Basse (1)</SelectItem>
                        <SelectItem value="2">Moyenne (2)</SelectItem>
                        <SelectItem value="3">Haute (3)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.precedence && <p className="text-red-500 text-sm mt-1">{errors.precedence}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="edit-asign_to"
                    className="text-right font-semibold"
                    style={{ color: "#4B5EAA" }}
                  >
                    Assignée à
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={formData.asign_to}
                      onValueChange={(value) => setFormData({ ...formData, asign_to: value })}
                      className="rounded-lg"
                      style={{ backgroundColor: "#F9FAFB", borderColor: "#D1D5DB" }}
                    >
                      <SelectTrigger
                        className="w-full"
                        style={{ color: "var(--body-text-dark)" }}
                      >
                        <SelectValue placeholder="Choisir un utilisateur" />
                      </SelectTrigger>
                      <SelectContent
                        style={{
                          backgroundColor: "#FFFFFF",
                          color: "var(--body-text-dark)",
                        }}
                      >
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.nom} {user.prenom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.asign_to && <p className="text-red-500 text-sm mt-1">{errors.asign_to}</p>}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleEditTask}
                  className="rounded-full px-6 py-2"
                  style={{
                    background: "linear-gradient(135deg, #4B5EAA, #8A9BFF)",
                    color: "#FFFFFF",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "linear-gradient(135deg, #3A4E89, #6F87E0)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "linear-gradient(135deg, #4B5EAA, #8A9BFF)")}
                >
                  Enregistrer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Dialog */}
          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogContent className="sm:max-w-[500px] rounded-xl">
              <DialogHeader>
                <DialogTitle
                  className="text-2xl font-bold"
                  style={{ color: "#F44336" }}
                >
                  Confirmer la Suppression
                </DialogTitle>
                <DialogDescription
                  className="text-md"
                  style={{ color: "var(--body-text)" }}
                >
                  Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteOpen(false)}
                  className="rounded-full px-6 py-2"
                  style={{
                    borderColor: "#D1D5DB",
                    color: "#4B5EAA",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F0F4F8")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleDeleteTask}
                  className="rounded-full px-6 py-2"
                  style={{
                    background: "linear-gradient(135deg, #F44336, #EF9A9A)",
                    color: "#FFFFFF",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "linear-gradient(135deg, #D32F2F, #E57373)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "linear-gradient(135deg, #F44336, #EF9A9A)")}
                >
                  Supprimer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Dialog */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogContent className="sm:max-w-[500px] rounded-xl">
              <DialogHeader>
                <DialogTitle
                  className="text-2xl font-bold"
                  style={{ color: "#4B5EAA" }}
                >
                  Ajouter une Tâche
                </DialogTitle>
                <DialogDescription
                  className="text-md"
                  style={{ color: "var(--body-text)" }}
                >
                  Remplissez les détails de la nouvelle tâche.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="titre"
                    className="text-right font-semibold"
                    style={{ color: "#4B5EAA" }}
                  >
                    Titre
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="titre"
                      value={formData.titre}
                      onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                      className={`rounded-lg ${errors.titre ? "border-red-500" : ""}`}
                      style={{ color: "var(--body-text-dark)", borderColor: "#D1D5DB" }}
                    />
                    {errors.titre && <p className="text-red-500 text-sm mt-1">{errors.titre}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="description"
                    className="text-right font-semibold"
                    style={{ color: "#4B5EAA" }}
                  >
                    Description
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={`rounded-lg ${errors.description ? "border-red-500" : ""}`}
                      style={{ color: "var(--body-text-dark)", borderColor: "#D1D5DB" }}
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="id_projet"
                    className="text-right font-semibold"
                    style={{ color: "#4B5EAA" }}
                  >
                    Projet
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="id_projet"
                      value={formData.id_projet}
                      onChange={(e) => setFormData({ ...formData, id_projet: e.target.value })}
                      className={`rounded-lg ${errors.id_projet ? "border-red-500" : ""}`}
                      style={{ color: "var(--body-text-dark)", borderColor: "#D1D5DB" }}
                    />
                    {errors.id_projet && <p className="text-red-500 text-sm mt-1">{errors.id_projet}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="start_date"
                    className="text-right font-semibold"
                    style={{ color: "#4B5EAA" }}
                  >
                    Date de début
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className={`rounded-lg ${errors.start_date ? "border-red-500" : ""}`}
                      style={{ color: "var(--body-text-dark)", borderColor: "#D1D5DB" }}
                    />
                    {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="echeance"
                    className="text-right font-semibold"
                    style={{ color: "#4B5EAA" }}
                  >
                    Échéance
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="echeance"
                      type="number"
                      value={formData.echeance}
                      onChange={(e) => setFormData({ ...formData, echeance: e.target.value })}
                      className={`rounded-lg ${errors.echeance ? "border-red-500" : ""}`}
                      style={{ color: "var(--body-text-dark)", borderColor: "#D1D5DB" }}
                    />
                    {errors.echeance && <p className="text-red-500 text-sm mt-1">{errors.echeance}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="precedence"
                    className="text-right font-semibold"
                    style={{ color: "#4B5EAA" }}
                  >
                    Précédence
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={formData.precedence}
                      onValueChange={(value) => setFormData({ ...formData, precedence: value })}
                      className="rounded-lg"
                      style={{ backgroundColor: "#F9FAFB", borderColor: "#D1D5DB" }}
                    >
                      <SelectTrigger
                        className="w-full"
                        style={{ color: "var(--body-text-dark)" }}
                      >
                        <SelectValue placeholder="Choisir une précédence" />
                      </SelectTrigger>
                      <SelectContent
                        style={{
                          backgroundColor: "#FFFFFF",
                          color: "var(--body-text-dark)",
                        }}
                      >
                        <SelectItem value="1">Basse (1)</SelectItem>
                        <SelectItem value="2">Moyenne (2)</SelectItem>
                        <SelectItem value="3">Haute (3)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.precedence && <p className="text-red-500 text-sm mt-1">{errors.precedence}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="asign_to"
                    className="text-right font-semibold"
                    style={{ color: "#4B5EAA" }}
                  >
                    Assignée à
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={formData.asign_to}
                      onValueChange={(value) => setFormData({ ...formData, asign_to: value })}
                      className="rounded-lg"
                      style={{ backgroundColor: "#F9FAFB", borderColor: "#D1D5DB" }}
                    >
                      <SelectTrigger
                        className="w-full"
                        style={{ color: "var(--body-text-dark)" }}
                      >
                        <SelectValue placeholder="Choisir un utilisateur" />
                      </SelectTrigger>
                      <SelectContent
                        style={{
                          backgroundColor: "#FFFFFF",
                          color: "var(--body-text-dark)",
                        }}
                      >
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.nom} {user.prenom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.asign_to && <p className="text-red-500 text-sm mt-1">{errors.asign_to}</p>}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleAddTask}
                  className="rounded-full px-6 py-2"
                  style={{
                    background: "linear-gradient(135deg, #4B5EAA, #8A9BFF)",
                    color: "#FFFFFF",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "linear-gradient(135deg, #3A4E89, #6F87E0)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "linear-gradient(135deg, #4B5EAA, #8A9BFF)")}
                >
                  Ajouter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Tasks;