"use client";
import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import crypto from "crypto";
import { toast } from "sonner";
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

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
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

  const fetchProjects = async () => {
    try {
      const response = await fetch(`http://alphatek.fr:3110/api/projects/`, {
        method: "GET",
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

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAddProject = async () => {
    if (!formData.title || !formData.description || !formData.start_date || !formData.end_date) {
      toast.error("Veuillez remplir les champs obligatoires : Titre, Description, Dates");
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
        headers: {
          "Content-Type": "application/json",
        },
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
    if (!formData.title || !formData.description || !formData.assign_to) {
      toast.error("Veuillez remplir les champs obligatoires : Titre, Description, Responsable");
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
        headers: {
          "Content-Type": "application/json",
        },
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
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Veuillez entrer une adresse e-mail valide");
      return;
    }

    const generateKeyWithTimestamp = (length = 32) => {
      const key = crypto.randomBytes(length).toString('base64url');
      const timestamp = Date.now();
      return key + timestamp.toString();
    };

    const uniqueKey = generateKeyWithTimestamp();
    console.log("Generated Token:", uniqueKey);

    const shareData = {
      email: formData.email,
      token: uniqueKey,
      project_id: selectedProject?.id,
    };
    console.log("Share Data:", shareData);

    setIsSharing(true);
    let emailSent = false;

    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const msg = {
      to: formData.email, // Change to your recipient
      from: 'asaleydiori@gmail.com', // Change to your verified sender
      subject: 'Invitation a un projet',
      text: 'and easy to do anywhere, even with Node.js',
      html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    }
    sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent')
      })
      .catch((error) => {
        console.error(error)
      })

    try {
      const emailResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: formData.email,
          subject: `Invitation au projet ${selectedProject?.title}`,
          body: `Vous avez été invité à rejoindre le projet "${selectedProject?.title}". Utilisez ce lien pour accepter : http://alphatek.fr/invite?token=${uniqueKey}`,
        }),
      });

      if (emailResponse.ok) {
        emailSent = true;
        console.log("Email sent successfully");
      } else {
        console.warn("Email sending failed, proceeding with insertion");
      }
    } catch (error) {
      console.warn("Erreur lors de l'envoi de l'email:", error);
    }

    try {
      const response = await fetch(`http://alphatek.fr:3110/api/invitations/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shareData),
      });

      if (!response.ok) {
        throw new Error('Erreur de réseau');
      }

      const data = await response.json();
      toast.success(emailSent ? data.message : `${data.message} (Email non envoyé)`);
      await fetchProjects();
      setIsShareOpen(false);
      setFormData((prev) => ({ ...prev, email: '' }));
      setSelectedProject(null);
    } catch (error) {
      console.error('Erreur lors du partage du projet:', error);
      toast.error('Erreur lors du partage du projet');
    } finally {
      setIsSharing(false);
    }
  };

  const handleDeleteProject = async () => {
    const projectToDelete = {
      id: selectedProject.id,
    };

    try {
      const response = await fetch(`http://alphatek.fr:3110/api/projects/delete/?id=${projectToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
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
    setIsShareOpen(true);
  };

  const openViewModal = (project) => {
    setSelectedProject(project);
    setIsViewOpen(true);
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
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="start_date" className="text-right">
                      Date de début
                    </Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) =>
                        setFormData({ ...formData, start_date: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="end_date" className="text-right">
                      Date de fin
                    </Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) =>
                        setFormData({ ...formData, end_date: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="assign_to" className="text-right">
                      Responsable
                    </Label>
                    <Input
                      id="assign_to"
                      value={formData.assign_to}
                      onChange={(e) =>
                        setFormData({ ...formData, assign_to: e.target.value })
                      }
                      className="col-span-3"
                      required
                    />
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
                    <TableHead className="w-[100px] font-bold text-sky-700">
                      ID
                    </TableHead>
                    <TableHead className="font-bold text-sky-700">Titre</TableHead>
                    <TableHead className="font-bold text-sky-700">
                      Description
                    </TableHead>
                    <TableHead className="font-bold text-sky-700">
                      Responsable
                    </TableHead>
                    <TableHead className="font-bold text-sky-700">
                      Date de début
                    </TableHead>
                    <TableHead className="font-bold text-sky-700">
                      Date de fin
                    </TableHead>
                    <TableHead className="text-right font-bold text-sky-700">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
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
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* View Details Modal */}
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
                <div className="grid grid-cols-4 items-center gap-4  items-center gap-4">
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

        {/* Edit Project Modal */}
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
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Description
                </Label>
                <Input
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-start_date" className="text-right">
                  Date de début
                </Label>
                <Input
                  id="edit-start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-end_date" className="text-right">
                  Date de fin
                </Label>
                <Input
                  id="edit-end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-assign_to" className="text-right">
                  Responsable
                </Label>
                <Input
                  id="edit-assign_to"
                  value={formData.assign_to}
                  onChange={(e) =>
                    setFormData({ ...formData, assign_to: e.target.value })
                  }
                  className="col-span-3"
                  required
                />
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

        {/* Share Project Modal */}
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
                <Input
                  id="share-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="col-span-3"
                  required
                />
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

        {/* Delete Confirmation Dialog */}
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