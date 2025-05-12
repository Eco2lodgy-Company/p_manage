"use client";
import React, { useState ,useEffect} from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
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
import { Trash2, Edit, Eye } from "lucide-react";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
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
    end_date: "",
    precedence: "",
    assignedTo: "",
  });

  const fetchTasks = async () => {

   try{
        const response = await fetch(`http://alphatek.fr:3110/api/tasks/`, {
          method: "GET"
        });
        if (!response.ok) {
          throw new Error("erreur de réseau");
        }
         const data = await response.json();
           setTasks(data.data);
           console.log(data.data);
      }catch (error) {
        console.error("Erreur lors de la recuperation des taches:", error);
      }
    }
  
    useEffect(() => {
      fetchTasks();
    }, []);

  const handleAddTask = async () => {
    if (!formData.titre || !formData.description ) {
      alert("Veuillez remplir les champs obligatoires : titre, description");
      return;
    }
    const newTask = {
      // id: `T${(tasks.length + 1).toString().padStart(3, "0")}`,
      titre: formData.titre,
      description: formData.description,
      id_projet: formData.id_projet,
      start_date: formData.start_date,
      end_date: formData.end_date,
      precedence: formData.precedence,
      assignedTo: formData.assignedTo,
    };

    try{
      const response = await fetch(`http://alphatek.fr:3110/api/tasks/add`, {
        method: "POST",
        body: JSON.stringify(newTask),
      });
      console.log("response",response);
      if (!response.ok) {
        throw new Error("erreur de réseau");
      }
    
       const data = await response.json();
         setUsers(data.data);
         toast.success("Tache ajoutée avec succès !");
      
    }catch (error) {
      console.error("Erreur lors de l'ajout  de la tache:", error);
      toast.error("Erreur lors de l'ajout  de la tache:", error);

    }
    setTasks([...tasks, newTask]);
    setFormData({
      titre: "",
      description: "",
      id_projet: "",
      start_date: "",
      end_date: "",
      precedence: "",
      assignedTo: "",
    });
    setIsAddOpen(false);
  };

  const handleEditTask = () => {
    setTasks(
      tasks.map((t) =>
        t.id === selectedTask.id
          ? {
              ...t,
              titre: formData.titre,
              description: formData.description,
              id_projet: formData.id_projet,
              start_date: formData.start_date,
              end_date: formData.end_date,
              precedence: formData.precedence,
              assignedTo: formData.assignedTo,
            }
          : t
      )
    );
    setIsEditOpen(false);
    setFormData({
      titre: "",
      description: "",
      id_projet: "",
      start_date: "",
      end_date: "",
      precedence: "",
      assignedTo: "",
    });
    setSelectedTask(null);
  };

  const handleDeleteTask = () => {
    setTasks(tasks.filter((t) => t.id !== selectedTask.id));
    setIsDeleteOpen(false);
    setSelectedTask(null);
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setFormData({
      titre: task.titre,
      description: task.description,
      id_projet: task.id_projet,
      start_date: task.start_date,
      end_date: task.end_date,
      precedence: task.precedence,
      assignedTo: task.assignedTo,
    });
    setIsEditOpen(true);
  };

  const openViewModal = (task) => {
    setSelectedTask(task);
    setIsViewOpen(true);
  };

  const openDeleteModal = (task) => {
    setSelectedTask(task);
    setIsDeleteOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:ml-64 lg:ml-64 xl:ml-64">
      {/* Fixed header */}
      <Toaster />
      <div className="fixed top-0 left-0 md:left-64 lg:left-64 xl:left-64 right-0 bg-sky-500 text-white p-4 shadow-md text-center z-10">
        <h1 className="text-2xl font-bold">Tâches</h1>
      </div>
      {/* Main content */}
      <div className="flex-1 flex flex-col p-6 pt-20">
        {/* Add Task Button */}
        <div className="flex justify-end mb-4">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                Ajouter une Tâche
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Ajouter une Tâche</DialogTitle>
                <DialogDescription>
                  Remplissez les détails de la nouvelle tâche.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Titre
                  </Label>
                  <Input
                    id="title"
                    value={formData.titre}
                    onChange={(e) =>
                      setFormData({ ...formData, titre: e.target.value })
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
                  <Label htmlFor="project" className="text-right">
                    Projet
                  </Label>
                  <Input
                    id="project"
                    value={formData.id_projet}
                    onChange={(e) =>
                      setFormData({ ...formData, id_projet: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startDate" className="text-right">
                    Date de début
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endDate" className="text-right">
                    Date de fin
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="precedence" className="text-right">
                    Précédence
                  </Label>
                  <Input
                    id="precedence"
                    value={formData.precedence}
                    onChange={(e) =>
                      setFormData({ ...formData, precedence: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="assignedTo" className="text-right">
                    Assignée à
                  </Label>
                  <Input
                    id="assignedTo"
                    value={formData.assignedTo}
                    onChange={(e) =>
                      setFormData({ ...formData, assignedTo: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleAddTask}
                  className="bg-sky-500 hover:bg-sky-600"
                >
                  Ajouter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {/* Table Container */}
        <div className="flex-1 bg-white shadow-md rounded-lg overflow-hidden">
          <div className="w-full h-full overflow-auto">
            <Table className="">
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
                    Projet
                  </TableHead>
                  <TableHead className="font-bold text-sky-700">
                    Date de début
                  </TableHead>
                  <TableHead className="font-bold text-sky-700">
                    Date de fin
                  </TableHead>
                  <TableHead className="font-bold text-sky-700">
                    Précédence
                  </TableHead>
                  <TableHead className="font-bold text-sky-700">
                    Assignée à
                  </TableHead>
                  <TableHead className="text-right font-bold text-sky-700">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow
                    key={task.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-medium">{task.id}</TableCell>
                    <TableCell>{task.titre}</TableCell>
                    <TableCell>{task.description}</TableCell>
                    <TableCell>{task.id_projet}</TableCell>
                    <TableCell>{task.start_date}</TableCell>
                    <TableCell>{task.end_date}</TableCell>
                    <TableCell>{task.precedence}</TableCell>
                    <TableCell>{task.assignedTo}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openViewModal(task)}
                          className="text-sky-500 hover:text-sky-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditModal(task)}
                          className="text-sky-500 hover:text-sky-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteModal(task)}
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
            <DialogTitle>Détails de la Tâche</DialogTitle>
            <DialogDescription>
              Informations complètes sur la tâche sélectionnée.
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">ID</Label>
                <span className="col-span-3">{selectedTask.id}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Titre</Label>
                <span className="col-span-3">{selectedTask.titre}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Description</Label>
                <span className="col-span-3">{selectedTask.description}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Projet</Label>
                <span className="col-span-3">{selectedTask.id_projet}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Date de début</Label>
                <span className="col-span-3">{selectedTask.start_date}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Date de fin</Label>
                <span className="col-span-3">{selectedTask.end_date}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Précédence</Label>
                <span className="col-span-3">{selectedTask.precedence}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Assignée à</Label>
                <span className="col-span-3">{selectedTask.assignedTo}</span>
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

      {/* Edit Task Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier la Tâche</DialogTitle>
            <DialogDescription>
              Mettez à jour les détails de la tâche.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">
                Titre
              </Label>
              <Input
                id="edit-title"
                value={formData.titre}
                onChange={(e) =>
                  setFormData({ ...formData, titre: e.target.value })
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
              <Label htmlFor="edit-project" className="text-right">
                Projet
              </Label>
              <Input
                id="edit-project"
                value={formData.id_projet}
                onChange={(e) =>
                  setFormData({ ...formData, id_projet: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-startDate" className="text-right">
                Date de début
              </Label>
              <Input
                id="edit-startDate"
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-endDate" className="text-right">
                Date de fin
              </Label>
              <Input
                id="edit-endDate"
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-precedence" className="text-right">
                Précédence
              </Label>
              <Input
                id="edit-precedence"
                value={formData.precedence}
                onChange={(e) =>
                  setFormData({ ...formData, precedence: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-assignedTo" className="text-right">
                Assignée à
              </Label>
              <Input
                id="edit-assignedTo"
                value={formData.assignedTo}
                onChange={(e) =>
                  setFormData({ ...formData, assignedTo: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleEditTask}
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
              Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible.
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
              onClick={handleDeleteTask}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}