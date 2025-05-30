"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Calendar as CalendarIcon, Trash2, Edit, Share2, Eye, Archive } from "lucide-react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Calendar from "react-calendar";
// import Sidebar from "@/components/Sidebar";
import { z } from "zod";
import crypto from "crypto";

// Define Zod schema for project validation
const projectSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(100, "Le titre ne doit pas dépasser 100 caractères"),
  description: z.string().min(1, "La description est requise").max(500, "La description ne doit pas dépasser 500 caractères"),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La date de début doit être au format YYYY-MM-DD").min(1, "La date de début est requise"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La date de fin doit être au format YYYY-MM-DD").min(1, "La date de fin est requise"),
  assign_to: z.string().min(1, "Le responsable est requis"),
  email: z.string().email("Veuillez entrer une adresse email valide").optional(),
});

// Static fallback data
const staticProjects = [
  {
    id: 1,
    title: "Projet A",
    description: "Développement d'une nouvelle application mobile.",
    start_date: "2025-05-28",
    end_date: "2025-06-10",
    assign_to: "1",
  },
  {
    id: 2,
    title: "Projet B",
    description: "Mise à jour du site web d'entreprise.",
    start_date: "2025-05-27",
    end_date: "2025-06-05",
    assign_to: "2",
  },
  {
    id: 3,
    title: "Projet C",
    description: "Analyse des données marketing.",
    start_date: "2025-05-26",
    end_date: "2025-06-02",
    assign_to: "3",
  },
];

const Projects = () => {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    assign_to: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // "table" or "calendar"
  const [loading, setLoading] = useState(true);

  // Fetch projects
  const fetchProjects = async () => {
    try {
      const response = await fetch("http://alphatek.fr:3110/api/projects/", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Erreur de réseau");
      const data = await response.json();
      const projectsArray = Array.isArray(data.data) ? data.data : Array.isArray(data.data[0]) ? data.data[0] : [];
      if (projectsArray.length > 0) {
        setProjects(projectsArray);
        setFilteredProjects(projectsArray);
      } else {
        setProjects(staticProjects); // Fallback to static data
        setFilteredProjects(staticProjects);
        toast.warning("Aucun projet récupéré, données statiques affichées.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des projets:", error);
      setProjects(staticProjects); // Fallback to static data
      setFilteredProjects(staticProjects);
      toast.error("Erreur lors de la récupération des projets, données statiques affichées.");
    }
  };

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const response = await fetch("http://alphatek.fr:3110/api/users/emp", {
        method: "GET",
      });
      if (!response.ok) throw new Error("Erreur de réseau");
      const data = await response.json();
      const employeeArray = Array.isArray(data.data) ? data.data : Array.isArray(data.data[0]) ? data.data[0] : [];
      setEmployees(employeeArray.length > 0 ? employeeArray : []);
      if (employeeArray.length === 0) toast.error("Aucun employé trouvé.");
    } catch (error) {
      console.error("Erreur lors de la récupération des employés:", error);
      setEmployees([]);
      toast.error("Erreur lors de la récupération des employés");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchProjects();
      await fetchEmployees();
      setLoading(false);
    };
    loadData();
  }, []);

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
  const getStatusName = (status) => {
    switch (status) {
      case "Terminé":
        return "Terminé";
      case "En cours":
        return "En cours";
      case "Non démarré":
        return "Non démarré";
      default:
        return "Non démarré";
    }
  };

  // Calculate progress based on dates
  const calculateProgress = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    if (now < start) return 0;
    if (now > end) return 100;
    const totalDuration = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / totalDuration) * 100);
  };

  // Determine status based on dates
  const getStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (now < start) return "Non démarré";
    if (now > end) return "Terminé";
    return "En cours";
  };

  // Validate form data
  const validateForm = (data, isSharing = false) => {
    const schema = isSharing ? projectSchema.pick({ email: true }) : projectSchema.omit({ email: true });
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

  // Add project
  const handleAddProject = async () => {
    const projectData = {
      title: formData.title,
      description: formData.description,
      start_date: formData.start_date,
      end_date: formData.end_date,
      assign_to: formData.assign_to,
    };
    if (!validateForm(projectData)) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }
    try {
      const response = await fetch("http://alphatek.fr:3110/api/projects/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });
      if (!response.ok) throw new Error("Erreur de réseau");
      const data = await response.json();
      toast.success(data.message);
      await fetchProjects();
      setFormData({ id: "", title: "", description: "", start_date: "", end_date: "", assign_to: "", email: "" });
      setIsAddOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout du projet:", error);
      toast.error("Erreur lors de l'ajout du projet");
    }
  };

  // Edit project
  const handleEditProject = async () => {
    const projectData = {
      id: formData.id,
      title: formData.title,
      description: formData.description,
      start_date: formData.start_date,
      end_date: formData.end_date,
      assign_to: formData.assign_to,
    };
    if (!validateForm(projectData)) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }
    try {
      const response = await fetch("http://alphatek.fr:3110/api/projects/edit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });
      if (!response.ok) throw new Error("Erreur de réseau");
      const data = await response.json();
      toast.success(data.message);
      await fetchProjects();
      setIsEditOpen(false);
      setFormData({ id: "", title: "", description: "", start_date: "", end_date: "", assign_to: "", email: "" });
      setSelectedProject(null);
    } catch (error) {
      console.error("Erreur lors de la modification du projet:", error);
      toast.error("Erreur lors de la modification du projet");
    }
  };

  // Share project
  const handleShareProject = async () => {
    if (!validateForm({ email: formData.email }, true)) {
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
      project_id: selectedProject?.id,
    };
    setIsSharing(true);
    try {
      const response = await fetch("http://alphatek.fr:3110/api/invitations/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shareData),
      });
      if (!response.ok) throw new Error("Erreur de réseau");
      const data = await response.json();
      toast.success(data.message);
      await fetchProjects();
      setIsShareOpen(false);
      setFormData((prev) => ({ ...prev, email: "" }));
      setSelectedProject(null);
    } catch (error) {
      console.error("Erreur lors du partage du projet:", error);
      toast.error("Erreur lors du partage du projet");
    } finally {
      setIsSharing(false);
    }
  };

  // Delete project
  const handleDeleteProject = async () => {
    try {
      const response = await fetch("http://alphatek.fr:3110/api/projects/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedProject.id }),
      });
      if (!response.ok) throw new Error("Erreur de réseau");
      const data = await response.json();
      toast.success(data.message);
      await fetchProjects();
      setIsDeleteOpen(false);
      setSelectedProject(null);
    } catch (error) {
      console.error("Erreur lors de la suppression du projet:", error);
      toast.error("Erreur lors de la suppression du projet");
    }
  };

  // Archive project
  const handleArchiveProject = async () => {
    try {
      const response = await fetch("http://alphatek.fr:3110/api/projects/archive", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedProject.id }),
      });
      if (!response.ok) throw new Error("Erreur de réseau");
      const data = await response.json();
      toast.success(data.message || "Projet archivé avec succès");
      await fetchProjects();
      setIsArchiveOpen(false);
      setSelectedProject(null);
    } catch (error) {
      console.error("Erreur lors de l'archivage du projet:", error);
      toast.error("Erreur lors de l'archivage du projet");
    }
  };

  // Open edit modal
  const openEditModal = (project) => {
    setSelectedProject(project);
    setFormData({
      id: project.id,
      title: project.title,
      description: project.description,
      start_date: project.start_date || "",
      end_date: project.end_date || "",
      assign_to: project.assign_to || "",
      email: "",
    });
    setErrors({});
    setIsEditOpen(true);
  };

  // Open share modal
  const openShareModal = (project) => {
    setSelectedProject(project);
    setFormData({ id: project.id, title: "", description: "", start_date: "", end_date: "", assign_to: "", email: "" });
    setErrors({});
    setIsShareOpen(true);
  };

  // Open view modal
  const openViewModal = (project) => {
    setSelectedProject(project);
    setIsViewOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (project) => {
    setSelectedProject(project);
    setIsDeleteOpen(true);
  };

  // Open archive modal
  const openArchiveModal = (project) => {
    setSelectedProject(project);
    setIsArchiveOpen(true);
  };

  // Filter and search projects
  useEffect(() => {
    let updatedProjects = [...projects];

    // Apply status filter
    if (statusFilter !== "all") {
      updatedProjects = updatedProjects.filter((project) => {
        const status = getStatus(project.start_date, project.end_date);
        return status.toLowerCase().replace(" ", "_") === statusFilter;
      });
    }

    // Apply search filter
    if (searchTerm) {
      updatedProjects = updatedProjects.filter(
        (project) =>
          project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProjects(updatedProjects);
  }, [searchTerm, statusFilter, projects]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col md:ml-64 items-center justify-center"
        style={{ backgroundColor: "var(--primary-bg)" }}
      >
        <h1 style={{ color: "var(--title-text)", fontWeight: "bold", fontSize: "1.5rem" }}>
          Chargement...
        </h1>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* <Sidebar /> */}
      <div
        className="flex-1 md:ml-64 min-h-screen flex flex-col"
        style={{ backgroundColor: "var(--primary-bg)" }}
      >
        <Toaster />
        {/* Header */}
        <div
          className="fixed top-0 left-0 md:left-64 right-0 p-4 shadow-md flex justify-between items-center z-10"
          style={{
            backgroundColor: "var(--header-bg)",
            color: "var(--header-text)",
          }}
        >
          <Button
            className="rounded-md"
            style={{
              backgroundColor: "var(--card-bg)",
              color: "var(--header-bg)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--hover-bg)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--card-bg)")}
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
            className="text-xl font-bold"
            style={{ color: "var(--header-text)" }}
          >
            Gestion des Projets
          </h1>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 mt-16 max-w-7xl mx-auto w-full">
          {/* Search, Filters, and Add Project Button */}
          <div
            className="p-4 rounded-lg shadow-md mb-4"
            style={{ backgroundColor: "var(--card-bg)" }}
          >
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
                <div className="relative w-full md:w-1/3">
                  <Input
                    placeholder="Rechercher un projet..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    style={{
                      backgroundColor: "var(--task-card-bg)",
                      color: "var(--body-text-dark)",
                    }}
                  />
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                    style={{ color: "var(--body-text)" }}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger
                    className="w-full md:w-1/4"
                    style={{
                      backgroundColor: "var(--task-card-bg)",
                      color: "var(--body-text-dark)",
                    }}
                  >
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent
                    style={{
                      backgroundColor: "var(--card-bg)",
                      color: "var(--body-text-dark)",
                    }}
                  >
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="non_démarré">Non démarré</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="terminé">Terminé</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => setViewMode(viewMode === "table" ? "calendar" : "table")}
                  className="rounded-md"
                  style={{
                    backgroundColor: "var(--header-bg)",
                    color: "var(--header-text)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--header-bg)")}
                >
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  {viewMode === "table" ? "Vue Calendrier" : "Vue Tableau"}
                </Button>
              </div>
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="rounded-md"
                    style={{
                      backgroundColor: "var(--header-bg)",
                      color: "var(--header-text)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--header-bg)")}
                  >
                    Ajouter un Projet
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Ajouter un Projet</DialogTitle>
                    <DialogDescription>Remplissez les détails du nouveau projet.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">Titre</Label>
                      <div className="col-span-3">
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className={errors.title ? "border-red-500" : ""}
                          style={{ color: "var(--body-text-dark)" }}
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">Description</Label>
                      <div className="col-span-3">
                        <Input
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className={errors.description ? "border-red-500" : ""}
                          style={{ color: "var(--body-text-dark)" }}
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="start_date" className="text-right">Date de début</Label>
                      <div className="col-span-3">
                        <Input
                          id="start_date"
                          type="date"
                          value={formData.start_date}
                          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                          className={errors.start_date ? "border-red-500" : ""}
                          style={{ color: "var(--body-text-dark)" }}
                        />
                        {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="end_date" className="text-right">Date de fin</Label>
                      <div className="col-span-3">
                        <Input
                          id="end_date"
                          type="date"
                          value={formData.end_date}
                          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                          className={errors.end_date ? "border-red-500" : ""}
                          style={{ color: "var(--body-text-dark)" }}
                        />
                        {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="assign_to" className="text-right">Responsable</Label>
                      <div className="col-span-3">
                        <Select
                          value={formData.assign_to}
                          onValueChange={(value) => setFormData({ ...formData, assign_to: value })}
                        >
                          <SelectTrigger
                            className="w-full"
                            style={{
                              backgroundColor: "var(--task-card-bg)",
                              color: "var(--body-text-dark)",
                            }}
                          >
                            <SelectValue placeholder="Responsable" />
                          </SelectTrigger>
                          <SelectContent
                            style={{
                              backgroundColor: "var(--card-bg)",
                              color: "var(--body-text-dark)",
                            }}
                          >
                            {employees.map((employee) => (
                              <SelectItem key={employee.id} value={employee.id}>
                                {employee.nom} {employee.prenom}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.assign_to && <p className="text-red-500 text-sm mt-1">{errors.assign_to}</p>}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleAddProject}
                      style={{
                        backgroundColor: "var(--header-bg)",
                        color: "var(--header-text)",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--header-bg)")}
                    >
                      Ajouter
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Table or Calendar View */}
          {viewMode === "table" ? (
            <div
              className="p-4 rounded-lg shadow-md"
              style={{ backgroundColor: "var(--card-bg)" }}
            >
              <h2
                className="text-lg font-bold mb-4"
                style={{ color: "var(--title-text)" }}
              >
                Liste des Projets
              </h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow
                      style={{ backgroundColor: "var(--tabs-bg)" }}
                    >
                      <TableHead
                        className="font-bold text-xs"
                        style={{ color: "var(--title-text)" }}
                      >
                        Titre
                      </TableHead>
                      <TableHead
                        className="font-bold text-xs"
                        style={{ color: "var(--title-text)" }}
                      >
                        Description
                      </TableHead>
                      <TableHead
                        className="font-bold text-xs"
                        style={{ color: "var(--title-text)" }}
                      >
                        Échéance
                      </TableHead>
                      <TableHead
                        className="font-bold text-xs"
                        style={{ color: "var(--title-text)" }}
                      >
                        Statut
                      </TableHead>
                      <TableHead
                        className="font-bold text-xs"
                        style={{ color: "var(--title-text)" }}
                      >
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.length > 0 ? (
                      filteredProjects.map((project) => {
                        const status = getStatus(project.start_date, project.end_date);
                        return (
                          <TableRow
                            key={project.id}
                            className="transition-colors"
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--hover-bg)")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <TableCell
                              className="text-xs"
                              style={{ color: "var(--body-text-dark)" }}
                            >
                              {project.title || ""}
                            </TableCell>
                            <TableCell
                              className="text-xs line-clamp-2"
                              style={{ color: "var(--body-text)" }}
                            >
                              {project.description || ""}
                            </TableCell>
                            <TableCell
                              className="text-xs"
                              style={{ color: "var(--body-text)" }}
                            >
                              {project.end_date || "N/A"}
                            </TableCell>
                            <TableCell>
                              <span
                                className="px-2 py-1 rounded-full text-xs"
                                style={{
                                  color: "var(--header-text)",
                                  backgroundColor:
                                    status === "Terminé"
                                      ? "var(--accent-green)"
                                      : status === "En cours"
                                      ? "var(--accent-yellow)"
                                      : "var(--accent-orange)",
                                }}
                              >
                                {getStatusName(status) || "N/A"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => openViewModal(project)}
                                  className="h-8 w-8"
                                  style={{
                                    color: "var(--border-accent)",
                                    borderColor: "var(--border-accent)",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--title-text)")}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--border-accent)")}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => openEditModal(project)}
                                  className="h-8 w-8"
                                  style={{
                                    color: "var(--border-accent)",
                                    borderColor: "var(--border-accent)",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--title-text)")}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--border-accent)")}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => openShareModal(project)}
                                  className="h-8 w-8"
                                  style={{
                                    color: "var(--border-accent)",
                                    borderColor: "var(--border-accent)",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--title-text)")}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--border-accent)")}
                                >
                                  <Share2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => openArchiveModal(project)}
                                  className="h-8 w-8"
                                  style={{
                                    color: "var(--accent-purple, #a855f7)",
                                    borderColor: "var(--accent-purple, #a855f7)",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.color = "#7c3aed")}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--accent-purple, #a855f7)")}
                                >
                                  <Archive className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => openDeleteModal(project)}
                                  className="h-8 w-8"
                                  style={{
                                    color: "var(--accent-red, #ef4444)",
                                    borderColor: "var(--accent-red, #ef4444)",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--accent-red, #ef4444)")}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center"
                          style={{ color: "var(--body-text)" }}
                        >
                          Aucun projet disponible
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div
              className="p-4 rounded-lg shadow-md"
              style={{ backgroundColor: "var(--card-bg)" }}
            >
              <h2
                className="text-lg font-bold mb-4"
                style={{ color: "var(--title-text)" }}
              >
                Vue Calendrier
              </h2>
              <Calendar
                value={new Date()}
                tileContent={({ date, view }) =>
                  view === "month" && filteredProjects.some((project) => {
                    const projectDate = new Date(project.start_date);
                    return projectDate.toDateString() === date.toDateString();
                  }) ? (
                    <div
                      className="text-xs rounded-full w-5 h-5 flex items-center justify-center"
                      style={{
                        backgroundColor: "var(--accent-yellow)",
                        color: "var(--header-text)",
                      }}
                    >
                      {filteredProjects.filter((project) => {
                        const projectDate = new Date(project.start_date);
                        return projectDate.toDateString() === date.toDateString();
                      }).length}
                    </div>
                  ) : null
                }
              />
            </div>
          )}
        </div>

        {/* View Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Détails du Projet</DialogTitle>
              <DialogDescription>Informations complètes sur le projet sélectionné.</DialogDescription>
            </DialogHeader>
            {selectedProject && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-bold" style={{ color: "var(--body-text-dark)" }}>
                    ID
                  </Label>
                  <span className="col-span-3" style={{ color: "var(--body-text)" }}>
                    {selectedProject.id}
                  </span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-bold" style={{ color: "var(--body-text-dark)" }}>
                    Titre
                  </Label>
                  <span className="col-span-3" style={{ color: "var(--body-text)" }}>
                    {selectedProject.title}
                  </span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-bold" style={{ color: "var(--body-text-dark)" }}>
                    Description
                  </Label>
                  <span className="col-span-3" style={{ color: "var(--body-text)" }}>
                    {selectedProject.description}
                  </span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-bold" style={{ color: "var(--body-text-dark)" }}>
                    Responsable
                  </Label>
                  <span className="col-span-3" style={{ color: "var(--body-text)" }}>
                    {employees.find(emp => emp.id === selectedProject.assign_to)?.nom || "N/A"} {employees.find(emp => emp.id === selectedProject.assign_to)?.prenom || ""}
                  </span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-bold" style={{ color: "var(--body-text-dark)" }}>
                    Date de début
                  </Label>
                  <span className="col-span-3" style={{ color: "var(--body-text)" }}>
                    {selectedProject.start_date}
                  </span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-bold" style={{ color: "var(--body-text-dark)" }}>
                    Date de fin
                  </Label>
                  <span className="col-span-3" style={{ color: "var(--body-text)" }}>
                    {selectedProject.end_date}
                  </span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-bold" style={{ color: "var(--body-text-dark)" }}>
                    Statut
                  </Label>
                  <span className="col-span-3" style={{ color: "var(--body-text)" }}>
                    {getStatusName(getStatus(selectedProject.start_date, selectedProject.end_date))}
                  </span>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                onClick={() => setIsViewOpen(false)}
                style={{
                  backgroundColor: "var(--header-bg)",
                  color: "var(--header-text)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--header-bg)")}
              >
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Modifier le Projet</DialogTitle>
              <DialogDescription>Mettez à jour les détails du projet.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-title" className="text-right">Titre</Label>
                <div className="col-span-3">
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={errors.title ? "border-red-500" : ""}
                    style={{ color: "var(--body-text-dark)" }}
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">Description</Label>
                <div className="col-span-3">
                  <Input
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={errors.description ? "border-red-500" : ""}
                    style={{ color: "var(--body-text-dark)" }}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-start_date" className="text-right">Date de début</Label>
                <div className="col-span-3">
                  <Input
                    id="edit-start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className={errors.start_date ? "border-red-500" : ""}
                    style={{ color: "var(--body-text-dark)" }}
                  />
                  {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-end_date" className="text-right">Date de fin</Label>
                <div className="col-span-3">
                  <Input
                    id="edit-end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className={errors.end_date ? "border-red-500" : ""}
                    style={{ color: "var(--body-text-dark)" }}
                  />
                  {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-assign_to" className="text-right">Responsable</Label>
                <div className="col-span-3">
                  <Select
                    value={formData.assign_to}
                    onValueChange={(value) => setFormData({ ...formData, assign_to: value })}
                  >
                    <SelectTrigger
                      className="w-full"
                      style={{
                        backgroundColor: "var(--task-card-bg)",
                        color: "var(--body-text-dark)",
                      }}
                    >
                      <SelectValue placeholder="Responsable" />
                    </SelectTrigger>
                    <SelectContent
                      style={{
                        backgroundColor: "var(--card-bg)",
                        color: "var(--body-text-dark)",
                      }}
                    >
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.nom} {employee.prenom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.assign_to && <p className="text-red-500 text-sm mt-1">{errors.assign_to}</p>}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleEditProject}
                style={{
                  backgroundColor: "var(--header-bg)",
                  color: "var(--header-text)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--header-bg)")}
              >
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share Dialog */}
        <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Invitez</DialogTitle>
              <DialogDescription>Ceci lui donnera un accès total à ce projet.</DialogDescription>
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
                    style={{ color: "var(--body-text-dark)" }}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleShareProject}
                disabled={isSharing}
                style={{
                  backgroundColor: "var(--header-bg)",
                  color: "var(--header-text)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--header-bg)")}
              >
                {isSharing ? "Envoi..." : "Partager"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirmer la Suppression</DialogTitle>
              <DialogDescription>Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteOpen(false)}
                style={{
                  borderColor: "var(--border-accent)",
                  color: "var(--border-accent)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--hover-bg)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                Annuler
              </Button>
              <Button
                onClick={handleDeleteProject}
                style={{
                  backgroundColor: "var(--accent-red, #ef4444)",
                  color: "var(--header-text)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-red, #ef4444)")}
              >
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Archive Dialog */}
        <Dialog open={isArchiveOpen} onOpenChange={setIsArchiveOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirmer l'Archivage</DialogTitle>
              <DialogDescription>Êtes-vous sûr de vouloir archiver ce projet ?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsArchiveOpen(false)}
                style={{
                  borderColor: "var(--border-accent)",
                  color: "var(--border-accent)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--hover-bg)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                Annuler
              </Button>
              <Button
                onClick={handleArchiveProject}
                style={{
                  backgroundColor: "var(--accent-purple, #a855f7)",
                  color: "var(--header-text)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#7c3aed")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-purple, #a855f7)")}
              >
                Archiver
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Projects;