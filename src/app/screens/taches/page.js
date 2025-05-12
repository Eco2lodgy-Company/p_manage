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
  const [tasks, setTasks] = useState([
    {
      id: "T001",
      titre: "Foundation Work",
      description: "Lay foundation for residential complex",
      id_projet: "id_projet Alpha",
      start_date: "2024-01-01",
      end_date: "2024-02-15",
      precedence: "None",
      assignedTo: "Jean Dupont",
    },
    {
      id: "T002",
      titre: "Structural Framing",
      description: "Erect steel framework",
      id_projet: "Project Beta",
      start_date: "2024-02-16",
      end_date: "2024-04-01",
      precedence: "T001",
      assignedTo: "Marie Leclerc",
    },
    ...Array.from({ length: 28 }, (_, i) => ({
      id: `T${(i + 3).toString().padStart(3, "0")}`,
      titre: `Task ${i + 3}`,
      description: `Description for task ${i + 3}`,
      project: `Project ${String.fromCharCode(65 + ((i + 3) % 26))}`,
      start_date: `2024-${String((i % 12) + 1).padStart(2, "0")}-01`,
      end_date: `2024-${String((i % 12) + 1).padStart(2, "0")}-15`,
      precedence: `T${(i + 2).toString().padStart(3, "0")}`,
      assignedTo: `Person ${i + 3}`,
    })),
  ]);
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
        const response = await fetch(`http://alphatek.fr:3110/api/users/`, {
          method: "GET"
        });
        if (!response.ok) {
          throw new Error("erreur de réseau");
        }
      
         const data = await response.json();
           setTasks(data.data);
        // if (data && Array.isArray(data)) {
        //   setUsers(data.data.map((user, index) => ({
        //     ...user,
        //     id: `USR${(index + 1).toString().padStart(3, "0")}`,
        //     created_at: user.created_at.split("T")[0], // Format date to YYYY-MM-DD
        //   })));
        // }
      }catch (error) {
        console.error("Erreur lors de la recuperation des taches:", error);
      }
    }
  
    useEffect(() => {
      fetchTasks();
    }, []);

  const handleAddTask = () => {
    const newTask = {
      id: `T${(tasks.length + 1).toString().padStart(3, "0")}`,
      title: formData.title,
      description: formData.description,
      project: formData.project,
      startDate: formData.startDate,
      endDate: formData.endDate,
      precedence: formData.precedence,
      assignedTo: formData.assignedTo,
    };
    setTasks([...tasks, newTask]);
    setFormData({
      title: "",
      description: "",
      project: "",
      startDate: "",
      endDate: "",
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
              title: formData.title,
              description: formData.description,
              project: formData.project,
              startDate: formData.startDate,
              endDate: formData.endDate,
              precedence: formData.precedence,
              assignedTo: formData.assignedTo,
            }
          : t
      )
    );
    setIsEditOpen(false);
    setFormData({
      title: "",
      description: "",
      project: "",
      startDate: "",
      endDate: "",
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
      title: task.title,
      description: task.description,
      project: task.project,
      startDate: task.startDate,
      endDate: task.endDate,
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
                  <Label htmlFor="project" className="text-right">
                    Projet
                  </Label>
                  <Input
                    id="project"
                    value={formData.project}
                    onChange={(e) =>
                      setFormData({ ...formData, project: e.target.value })
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
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
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
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
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
                <span className="col-span-3">{selectedTask.title}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Description</Label>
                <span className="col-span-3">{selectedTask.description}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Projet</Label>
                <span className="col-span-3">{selectedTask.project}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Date de début</Label>
                <span className="col-span-3">{selectedTask.startDate}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Date de fin</Label>
                <span className="col-span-3">{selectedTask.endDate}</span>
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
              <Label htmlFor="edit-project" className="text-right">
                Projet
              </Label>
              <Input
                id="edit-project"
                value={formData.project}
                onChange={(e) =>
                  setFormData({ ...formData, project: e.target.value })
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
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
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
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
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