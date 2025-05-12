"use client";
import React, { use, useState } from "react";
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
import { Trash2, Edit,Share2, Eye } from "lucide-react";
import { data } from "framer-motion/client";

export default function Projects() {
  const [projects, setProjects] = useState([
    {
      id: "INV001",
      title: "Project Alpha",
      description: "Building a residential complex",
      amount: 250.0,
      date_debut: "2023-01-01", 
      responsable: "John Doe",
      date_fin: "2023-06-01",
    },
    {
      id: "INV002",
      title: "Project Beta",
      description: "Commercial office renovation",
      amount: 500.0,
      responsable: "John Doe",
      date_debut: "2023-01-01", 
      date_fin: "2023-06-01",
    },
  ]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    description: "",
    amount: "",
  });

   const fetchProjects = async () => {

   try{
        const response = await fetch(`http://alphatek.fr:3110/api/projects/`, {
          method: "GET"
        });
        if (!response.ok) {
          throw new Error("erreur de réseau");
        }
         const data = await response.json();
           setProjects(data.data);
           console.log(data.data);
      }catch (error) {
        console.error("Erreur lors de la recuperation des taches:", error);
      }
    }
    useEffect(() => {
      fetchProjects();
    }, []);

  

  const handleAddProject = () => {
    const newProject = {
      id: `INV${(projects.length + 1).toString().padStart(3, "0")}`,
      title: formData.title,
      description: formData.description,
      amount: parseFloat(formData.amount) || 0,
    };
    setProjects([...projects, newProject]);
    setFormData({ id: "", title: "", description: "", amount: "" });
    setIsAddOpen(false);
  };

  const handleEditProject = () => {
    setProjects(
      projects.map((p) =>
        p.id === selectedProject.id
          ? {
              ...p,
              title: formData.title,
              description: formData.description,
              amount: parseFloat(formData.amount) || p.amount,
            }
          : p
      )
    );
    setIsEditOpen(false);
    setFormData({ id: "", title: "", description: "", amount: "" });
    setSelectedProject(null);
  };


  const handleShareProject = () => {
    setProjects(
      projects.map((p) =>
        p.id === selectedProject.id
          
      )
    );
    setIsShareOpen(false);
    setFormData({ id: "" });
    setSelectedProject(null);
  };

  const handleDeleteProject = () => {
    setProjects(projects.filter((p) => p.id !== selectedProject.id));
    setIsDeleteOpen(false);
    setSelectedProject(null);
  };

  const openEditModal = (project) => {
    setSelectedProject(project);
    setFormData({
      id: project.id,
      title: project.title,
      description: project.description,
      amount: project.amount.toString(),
    });
    setIsEditOpen(true);
  };

  const openShareModal = (project) => {
    setSelectedProject(project);
    setFormData({
      id: project.id,
      title: project.title,
      description: project.description,
      amount: project.amount.toString(),
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
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                      Montant ($)
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      className="col-span-3"
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
                    <TableHead className="text-right font-bold text-sky-700">
                      Responsable
                    </TableHead>
                    <TableHead className="text-right font-bold text-sky-700">
                      Date de debut
                    </TableHead>
                    <TableHead className="text-right font-bold text-sky-700">
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
                      <TableCell>{project.responsable}</TableCell>
                      <TableCell className="text-right">
                        {project.date_debut}
                      </TableCell>
                      <TableCell className="text-right">
                        {project.date_fin}
                      </TableCell>
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

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-bold">Date de debut </Label>
                  <span className="col-span-3">
                    {selectedProject.amount.toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-bold">Date de fin </Label>
                  <span className="col-span-3">
                    {selectedProject.amount.toFixed(2)}
                  </span>
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
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-amount" className="text-right">
                  Montant ($)
                </Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="col-span-3"
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
                <Label htmlFor="edit-title" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="col-span-3"
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