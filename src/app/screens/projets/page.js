"use client";
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import crypto from "crypto";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {  Select,  SelectContent,  SelectItem,  SelectTrigger,  SelectValue,} from "@/components/ui/select"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  const [employees, setEmployees] = useState(null);
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

  const fetchProjects = async () => {
    try {
      const response = await fetch(`http://alphatek.fr:3110/api/projects/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Erreur de réseau");
      }
      const data = await response.json();
      setProjects(data.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des projets:", error);
      toast.error("Erreur lors de la récupération des projets");
    }
  };

  const fetchEmployees = async () => {
      try {
        const response = await fetch(`http://alphatek.fr:3110/api/users/emp`, {
          method: "GET",
        });
        if (!response.ok) {
          throw new Error("Erreur de réseau");
        }
        const data = await response.json();
        
        const emploeeAray = Array.isArray(data.data) ? data.data : Array.isArray(data.data[0]) ? data.data[0] : [];
        if (emploeeAray.length > 0) {
          setEmployees(emploeeAray);
          
        } else {
          setEmployees([]);
          toast.error("Tâches non trouvées ou format incorrect");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des tâches:", error);
        setEmployees([]);
        toast.error("Erreur lors de la récupération des tâches");
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

  const validateForm = (data, isSharing = false) => {
    const schema = isSharing
      ? projectSchema.pick({ email: true })
      : projectSchema.omit({ email: true });
    const result = schema.safeParse(data);
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

  const handleAddProject = async () => {
    if (!validateForm(formData)) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    const newProject = {
      title: formData.title,
      description: formData.description,
      start_date: formData.start_date,
      end_date: formData.end_date,
      assign_to: formData.assign_to,
    };

    try {
      const response = await fetch(`http://alphatek.fr:3110/api/projects/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });
      if (!response.ok) {
        throw new Error("Erreur de réseau");
      }
      const data = await response.json();
      toast.success(data.message);
      await fetchProjects();
      setFormData({
        id: "",
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        assign_to: "",
        email: "",
      });
      setIsAddOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout du projet:", error);
      toast.error("Erreur lors de l'ajout du projet");
    }
  };

  const handleEditProject = async () => {
    if (!validateForm(formData)) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    const projectToEdit = {
      id: formData.id,
      title: formData.title,
      description: formData.description,
      start_date: formData.start_date,
      end_date: formData.end_date,
      assign_to: formData.assign_to,
    };

    try {
      const response = await fetch(`http://alphatek.fr:3110/api/projects/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectToEdit),
      });
      if (!response.ok) {
        throw new Error("Erreur de réseau");
      }
      const data = await response.json();
      toast.success(data.message);
      await fetchProjects();
      setIsEditOpen(false);
      setFormData({
        id: "",
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        assign_to: "",
        email: "",
      });
      setSelectedProject(null);
    } catch (error) {
      console.error("Erreur lors de la modification du projet:", error);
      toast.error("Erreur lors de la modification du projet");
    }
  };

  const handleShareProject = async () => {
    if (!validateForm({ email: formData.email }, true)) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    const generateKeyWithTimestamp = (length = 32) => {
      const bytes = crypto.randomBytes(length);
      const base64 = bytes.toString("base64");
      const base64url = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      const timestamp = Date.now();
      return base64url + timestamp.toString();
    };

    const uniqueKey = generateKeyWithTimestamp();

    const shareData = {
      email: formData.email,
      token: uniqueKey,
      project_id: selectedProject?.id,
    };

    setIsSharing(true);
    let emailSent = false;

    try {
      const response = await fetch(`http://alphatek.fr:3110/api/invitations/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shareData),
      });
      if (!response.ok) {
        throw new Error("Erreur de réseau");
      }
      emailSent = true;
      const data = await response.json();
      toast.success(emailSent ? data.message : `${data.message} (Email non envoyé)`);
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

  const handleDeleteProject = async () => {
    const projectToDelete = { id: selectedProject.id };
    try {
      const response = await fetch(`http://alphatek.fr:3110/api/projects/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectToDelete),
      });
      if (!response.ok) {
        throw new Error("Erreur de réseau");
      }
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

  const openShareModal = (project) => {
    setSelectedProject(project);
    setFormData({
      id: project.id,
      title: "",
      description: "",
      start_date: "",
      end_date: "",
      assign_to: "",
      email: "",
    });
    setErrors({});
    setIsShareOpen(true);
  };

  const router = useRouter();
  const openViewModal = (project) => {
    setSelectedProject(project);
    if (typeof window !== "undefined") {
      localStorage.setItem("projectId", project.id);
    }
    const id = localStorage.getItem("projectId") || "0";
    router.push(`projets/details?id=${project.id}`);
  };

  const openDeleteModal = (project) => {
    setSelectedProject(project);
    setIsDeleteOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:ml-64 lg:ml-64 xl:ml-64">
      <Toaster />
      <div className="flex flex-col items-center justify-start p-6 h-full">
        <div className="fixed top-0 left-0 md:left-64 lg:left-64 xl:left-64 right-0 bg-sky-500 text-white p-4 shadow-md text-center z-10">
          <h1 className="text-2xl font-bold">Projets</h1>
        </div>
        <div className="w-full max-w-4xl mt-20">
          <div className="flex justify-end mb-4">
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                  Ajouter un Projet
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Ajouter un Projet</DialogTitle>
                  <DialogDescription>
                    Remplissez les détails du nouveau projet.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Titre
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className={errors.title ? "border-red-500" : ""}
                      />
                      {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        className={errors.description ? "border-red-500" : ""}
                      />
                      {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="start_date" className="text-right">
                      Date de début
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) =>
                          setFormData({ ...formData, start_date: e.target.value })
                        }
                        className={errors.start_date ? "border-red-500" : ""}
                      />
                      {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="end_date" className="text-right">
                      Date de fin
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) =>
                          setFormData({ ...formData, end_date: e.target.value })
                        }
                        className={errors.end_date ? "border-red-500" : ""}
                      />
                      {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="assign_to" className="text-right">
                      Responsable
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="assign_to"
                        value={formData.assign_to}
                        onChange={(e) =>
                          setFormData({ ...formData, assign_to: e.target.value })
                        }
                        className={errors.assign_to ? "border-red-500" : ""}
                      />
                      <Select>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Responsable" />
                            </SelectTrigger>
                            <SelectContent>
                              {employees && employees.map((employee) => (
                                <SelectItem key={employee.id} value={employee.id}>
                                  {employee.nom} {employee.prenom}
                                </SelectItem>
                              ))}
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                      </Select>

                      {errors.assign_to && <p className="text-red-500 text-sm mt-1">{errors.assign_to}</p>}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    onClick={handleAddProject}
                    className="bg-sky-500 hover:bg-sky-600"
                  >
                    Ajouter
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-sky-50">
                    <TableHead className="w-[100px] font-bold text-sky-700">ID</TableHead>
                    <TableHead className="font-bold text-sky-700">Titre</TableHead>
                    <TableHead className="font-bold text-sky-700">Description</TableHead>
                    <TableHead className="font-bold text-sky-700">Responsable</TableHead>
                    <TableHead className="font-bold text-sky-700">Date de début</TableHead>
                    <TableHead className="font-bold text-sky-700">Date de fin</TableHead>
                    <TableHead className="text-right font-bold text-sky-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.length > 0 ? (
                    projects.map((project) => (
                      <TableRow
                        key={project.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <TableCell className="font-medium">{project.id}</TableCell>
                        <TableCell>{project.title}</TableCell>
                        <TableCell>{project.description}</TableCell>
                        <TableCell>{project.assign_to}</TableCell>
                        <TableCell>{project.start_date}</TableCell>
                        <TableCell>{project.end_date}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openViewModal(project)}
                              className="text-sky-500 hover:text-sky-700"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openEditModal(project)}
                              className="text-sky-500 hover:text-sky-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openShareModal(project)}
                              className="text-sky-500 hover:text-sky-700"
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openDeleteModal(project)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Aucun projet trouvé.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Détails du Projet</DialogTitle>
              <DialogDescription>
                Informations complètes sur le projet sélectionné.
              </DialogDescription>
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
              <Button
                onClick={() => setIsViewOpen(false)}
                className="bg-sky-500 hover:bg-sky-600"
              >
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Modifier le Projet</DialogTitle>
              <DialogDescription>
                Mettez à jour les détails du projet.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-title" className="text-right">
                  Titre
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Description
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-start_date" className="text-right">
                  Date de début
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    className={errors.start_date ? "border-red-500" : ""}
                  />
                  {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-end_date" className="text-right">
                  Date de fin
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                    className={errors.end_date ? "border-red-500" : ""}
                  />
                  {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-assign_to" className="text-right">
                  Responsable
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-assign_to"
                    value={formData.assign_to}
                    onChange={(e) =>
                      setFormData({ ...formData, assign_to: e.target.value })
                    }
                    className={errors.assign_to ? "border-red-500" : ""}
                  />
                  {errors.assign_to && <p className="text-red-500 text-sm mt-1">{errors.assign_to}</p>}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleEditProject}
                className="bg-sky-500 hover:bg-sky-600"
              >
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Invitez</DialogTitle>
              <DialogDescription>
                Ceci lui donnera un accès total à ce projet.
              </DialogDescription>
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
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleShareProject}
                className="bg-sky-500 hover:bg-sky-600"
                disabled={isSharing}
              >
                {isSharing ? "Envoi..." : "Partager"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirmer la Suppression</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteOpen(false)}
                className="border-sky-500 text-sky-500 hover:bg-sky-50"
              >
                Annuler
              </Button>
              <Button
                onClick={handleDeleteProject}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}