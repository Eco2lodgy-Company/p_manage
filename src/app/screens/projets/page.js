"use client";
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import crypto from "crypto";
import { Toaster, toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Edit, Share2, Eye } from "lucide-react";

// Define Zod schema for project validation
const projectSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(100, "Le titre ne doit pas dépasser 100 caractères"),
  description: z.string().min(1, "La description est requise").max(500, "La description ne doit pas dépasser 500 caractères"),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La date de début doit être au format YYYY-MM-DD").min(1, "La date de début est requise"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La date de fin doit être au format YYYY-MM-DD").min(1, "La date de fin est requise"),
  assign_to: z.string().min(1, "Le responsable est requis"),
  email: z.string().email("Veuillez entrer une adresse email valide").optional(),
});

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
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
  const router = useRouter();

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      const response = await fetch(`http://alphatek.fr:3110/api/projects/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Erreur de réseau");
      const data = await response.json();
      setProjects(data.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des projets:", error);
      toast.error("Erreur lors de la récupération des projets");
    }
  };

  // Fetch employees from API
  const fetchEmployees = async () => {
    try {
      const response = await fetch(`http://alphatek.fr:3110/api/users/emp`, {
        method: "GET",
      });
      if (!response.ok) throw new Error("Erreur de réseau");
      const data = await response.json();
      const employeeArray = Array.isArray(data.data) ? data.data : Array.isArray(data.data[0]) ? data.data[0] : [];
      setEmployees(employeeArray.length > 0 ? employeeArray : []);
      if (employeeArray.length === 0) toast.error("Tâches non trouvées ou format incorrect");
    } catch (error) {
      console.error("Erreur lors de la récupération des tâches:", error);
      setEmployees([]);
      toast.error("Erreur lors de la récupération des tâches");
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

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
    if (!validateForm(formData)) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }
    try {
      const response = await fetch(`http://alphatek.fr:3110/api/projects/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          start_date: formData.start_date,
          end_date: formData.end_date,
          assign_to: formData.assign_to,
        }),
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
    if (!validateForm(formData)) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }
    try {
      const response = await fetch(`http://alphatek.fr:3110/api/projects/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: formData.id,
          title: formData.title,
          description: formData.description,
          start_date: formData.start_date,
          end_date: formData.end_date,
          assign_to: formData.assign_to,
        }),
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
      const response = await fetch(`http://alphatek.fr:3110/api/invitations/add`, {
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
      const response = await fetch(`http://alphatek.fr:3110/api/projects/delete`, {
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
    if (typeof window !== "undefined") {
      localStorage.setItem("projectId", project.id);
    }
    router.push(`projets/details?id=${project.id}`);
  };

  // Open delete modal
  const openDeleteModal = (project) => {
    setSelectedProject(project);
    setIsDeleteOpen(true);
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

  // Determine status based on progress
  const getStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (now < start) return "Non démarré";
    if (now > end) return "Terminé";
    return "En cours";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:ml-64 lg:ml-64 xl:ml-64 p-6">
      <Toaster />
      <div className="fixed top-0 left-0 md:left-64 lg:left-64 xl:left-64 right-0 bg-sky-500 text-white p-4 shadow-md text-center z-10">
        <h1 className="text-2xl font-bold">Projets</h1>
      </div>
      <div className="mt-20 max-w-7xl mx-auto">
        <div className="flex justify-end mb-6">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-sky-500 hover:bg-sky-600 text-white">Ajouter un Projet</Button>
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
                <Button onClick={handleAddProject} className="bg-sky-500 hover:bg-sky-600">Ajouter</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.length > 0 ? (
            projects.map((project) => {
              const progress = calculateProgress(project.start_date, project.end_date);
              const status = getStatus(project.start_date, project.end_date);
              return (
                <div
                  key={project.id}
                  className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow"
                >
                  <h2 className="text-xl font-bold text-sky-700">{project.title}</h2>
                  <p className="text-gray-600 line-clamp-3">{project.description}</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Échéance</span>
                      <span className="text-sm text-gray-600">{project.end_date}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Statut</span>
                      <span
                        className={`text-sm font-semibold ${
                          status === "Terminé"
                            ? "text-green-500"
                            : status === "En cours"
                            ? "text-yellow-500"
                            : "text-red-500"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          status === "Terminé"
                            ? "bg-green-500"
                            : status === "En cours"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openViewModal(project)}
                      className="text-sky-500 hover:text-sky-700 border-sky-500"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditModal(project)}
                      className="text-sky-500 hover:text-sky-700 border-sky-500"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openShareModal(project)}
                      className="text-sky-500 hover:text-sky-700 border-sky-500"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openDeleteModal(project)}
                      className="text-red-500 hover:text-red-700 border-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 text-center text-gray-600">Aucun projet trouvé.</div>
          )}
        </div>
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
                <span className="col-span-3">{selectedProject.assign_to}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Date de début</Label>
                <span className="col-span-3">{selectedProject.start_date}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Date de fin</Label>
                <span className="col-span-3">{selectedProject.end_date}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewOpen(false)} className="bg-sky-500 hover:bg-sky-600">Fermer</Button>
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
            <Button onClick={handleEditProject} className="bg-sky-500 hover:bg-sky-600">Enregistrer</Button>
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
            <Button onClick={handleShareProject} className="bg-sky-500 hover:bg-sky-600" disabled={isSharing}>
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
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="border-sky-500 text-sky-500 hover:bg-sky-50">
              Annuler
            </Button>
            <Button onClick={handleDeleteProject} className="bg-red-500 hover:bg-red-600 text-white">
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}