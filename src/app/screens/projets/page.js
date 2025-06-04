"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, Plus, Edit3, Trash2, Archive, FolderOpen, Calendar, User, Share2 } from "lucide-react";
import { Toaster, toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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

const ProjectsPage = () => {
  // State management
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [localId,setLocalId] = useState("");
  const [isSharing, setIsSharing] = useState(false);
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

  // Fetch projects
 

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
    const id = localStorage.getItem("firm");
    setLocalId(id);
    console.log("Firm ID:", id);
     const fetchProjects = async () => {
    try {
      const fId= localStorage.getItem("firm");
      const response = await fetch(`http://alphatek.fr:3110/api/projects?firm=${fId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Erreur de réseau");
      const data = await response.json();
      const projectsArray = Array.isArray(data.data) ? data.data : Array.isArray(data.data) ? data.data : [];
      if (projectsArray.length > 0) {
        setProjects(projectsArray);
      } else {
        toast.warning("Aucun projet récupéré.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des projets:", error);
      toast.error("Erreur lors de la récupération des projets.");
    }
  };
    const loadData = async () => {
      await fetchProjects();
      await fetchEmployees();
    };
    loadData();
  }, [localId]);

  // Calculate status based on dates
  const getStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (now < start) return "pending"; // En attente
    if (now > end) return "done"; // Terminé
    return "in_progress"; // En cours
  };

  // Get status info for display
  const getStatusInfo = (project) => {
    const state = project.state || getStatus(project.start_date, project.end_date);
    switch (state) {
      case "in_progress":
        return { label: "En cours", color: "bg-primary/10 text-primary", dot: "bg-primary" };
      case "done":
        return { label: "Terminé", color: "bg-success/10 text-success", dot: "bg-success" };
      case "pending":
        return { label: "En attente", color: "bg-warning/10 text-warning", dot: "bg-warning" };
      default:
        return { label: "Non défini", color: "bg-muted/50 text-muted-foreground", dot: "bg-muted-foreground" };
    }
  };

  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return "Non définie";
    return new Date(dateString).toLocaleDateString("fr-FR");
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

  // Open view modal
  // Ouvre la page de détails du projet
  const handleOpen = (project) => {
    window.location.href = `/screens/projets/details?id=${project.id}`;
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

  // Filtered projects
  const filteredProjects = useMemo(() => {
    let filtered = projects.map(project => ({
      ...project,
      state: project.state || getStatus(project.start_date, project.end_date),
    }));

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter(project => project.state === activeTab);
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [projects, activeTab, searchTerm]);

  const tabs = [
    { key: "all", label: "Tous", count: projects.length },
    { key: "in_progress", label: "En cours", count: projects.filter(p => (p.state || getStatus(p.start_date, p.end_date)) === "in_progress").length },
    { key: "done", label: "Terminés", count: projects.filter(p => (p.state || getStatus(p.start_date, p.end_date)) === "done").length },
    { key: "pending", label: "En attente", count: projects.filter(p => (p.state || getStatus(p.start_date, p.end_date)) === "pending").length },
  ];

  return (
    <div className="min-h-screen bg-background p-6 min-h-screen bg-gray-100 bg-background md:ml-64 lg:ml-64 xl:ml-64">
      <Toaster />
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Projets</h1>
          <p className="text-muted-foreground">Gérez vos projets et suivez leur progression</p>
        </div>

        {/* Barre d'actions */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Recherche */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un projet..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Bouton nouveau projet */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <Plus className="w-4 h-4" />
                Nouveau projet
              </button>
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
                      className={errors.title ? "border-green-500" : ""}
                    />
                    {errors.title && <p className="text-green-500 text-sm mt-1">{errors.title}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">Description</Label>
                  <div className="col-span-3">
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={errors.description ? "border-green-500" : ""}
                    />
                    {errors.description && <p className="text-green-500 text-sm mt-1">{errors.description}</p>}
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
                      className={errors.start_date ? "border-green-500" : ""}
                    />
                    {errors.start_date && <p className="text-green-500 text-sm mt-1">{errors.start_date}</p>}
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
                      className={errors.end_date ? "border-green-500" : ""}
                    />
                    {errors.end_date && <p className="text-green-500 text-sm mt-1">{errors.end_date}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="assign_to" className="text-right">Responsable</Label>
                  <div className="col-span-3">
                    <Select
                      value={formData.assign_to}
                      onValueChange={(value) => setFormData({ ...formData, assign_to: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Responsable" />
                      </SelectTrigger>
                      <SelectContent>
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
                <Button onClick={handleAddProject} className="bg-primary hover:bg-primary/90">
                  Ajouter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Onglets */}
        <div className="mb-6">
          <div className="border-b border-border">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-muted text-muted-foreground py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Grille des projets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => {
            const statusInfo = getStatusInfo(project);
            const assignedEmployee = employees.find(emp => emp.id === project.assign_to);
            return (
              <div key={project.id} className="bg-Color rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow">
                {/* En-tête de la carte */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-card-foreground truncate">{project.title}</h3>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${statusInfo.dot}`}></div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{project.description}</p>

                  {/* Informations du projet */}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(project.start_date)} - {formatDate(project.end_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Assigné à: {assignedEmployee ? `${assignedEmployee.nom} ${assignedEmployee.prenom}` : "Non assigné"}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 border-t border-border bg-muted/50 rounded-b-lg">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleOpen(project)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      <FolderOpen className="w-3 h-3" />
                      Ouvrir
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(project)}
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                        title="Éditer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openShareModal(project)}
                        className="p-1.5 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded transition-colors"
                        title="Partager"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openArchiveModal(project)}
                        className="p-1.5 text-muted-foreground hover:text-warning hover:bg-warning/10 rounded transition-colors"
                        title="Archiver"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(project)}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message si aucun projet */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <FolderOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Aucun projet trouvé</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Aucun projet ne correspond à votre recherche." : "Aucun projet dans cette catégorie."}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsAddOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Créer votre premier projet
              </button>
            )}
          </div>
        )}

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
                  <Label className="text-right font-bold">ID</Label>
                  <span className="col-span-3">{selectedProject.id}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-bold">Titre</Label>
                  <span className="col-span-3">{selectedProject.title}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-bold">Description</Label>
                  <span className="col-span-3">{selectedProject.description}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-bold">Responsable</Label>
                  <span className="col-span-3">
                    {employees.find(emp => emp.id === selectedProject.assign_to)?.nom || "N/A"} {employees.find(emp => emp.id === selectedProject.assign_to)?.prenom || ""}
                  </span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-bold">Date de début</Label>
                  <span className="col-span-3">{formatDate(selectedProject.start_date)}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-bold">Date de fin</Label>
                  <span className="col-span-3">{formatDate(selectedProject.end_date)}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-bold">Statut</Label>
                  <span className="col-span-3">{getStatusInfo(selectedProject).label}</span>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsViewOpen(false)} className="bg-primary hover:bg-primary/90">
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
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Responsable" />
                    </SelectTrigger>
                    <SelectContent>
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
              <Button onClick={handleEditProject} className="bg-primary hover:bg-primary/90">
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
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleShareProject} disabled={isSharing} className="bg-primary hover:bg-primary/90">
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
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="border-border text-foreground">
                Annuler
              </Button>
              <Button onClick={handleDeleteProject} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
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
              <Button variant="outline" onClick={() => setIsArchiveOpen(false)} className="border-border text-foreground">
                Annuler
              </Button>
              <Button onClick={handleArchiveProject} className="bg-warning hover:bg-warning/90 text-warning-foreground">
                Archiver
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProjectsPage;