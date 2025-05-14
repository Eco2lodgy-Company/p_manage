'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AddTaskForm() {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    id_projet: 0,
    start_date: '',
    echeance: '',
  });
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/taches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/tasks');
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la création');
      }
    } catch (err) {
      setError('Erreur serveur');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Ajouter une tâche</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <div className="mb-4">
        <label htmlFor="titre" className="block mb-1">Titre</label>
        <input
          type="text"
          id="titre"
          value={formData.titre}
          onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="block mb-1">Description</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="id_projet" className="block mb-1">ID Projet</label>
        <input
          type="number"
          id="id_projet"
          value={formData.id_projet}
          onChange={(e) => setFormData({ ...formData, id_projet: parseInt(e.target.value) })}
          className="w-full border p-2 rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="start_date" className="block mb-1">Date de début</label>
        <input
          type="date"
          id="start_date"
          value={formData.start_date}
          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="echeance" className="block mb-1">Échéance</label>
        <input
          type="date"
          id="echeance"
          value={formData.echeance}
          onChange={(e) => setFormData({ ...formData, echeance: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Ajouter la tâche
      </button>
    </form>
  );
}

export function EditTaskForm({ task }) {
  const [formData, setFormData] = useState(task || {
    titre: '',
    description: '',
    id_projet: 0,
    start_date: '',
    echeance: '',
  });
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/taches/${task?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/tasks');
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la modification');
      }
    } catch (err) {
      setError('Erreur serveur');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Modifier la tâche</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <div className="mb-4">
        <label htmlFor="titre" className="block mb-1">Titre</label>
        <input
          type="text"
          id="titre"
          value={formData.titre}
          onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="block mb-1">Description</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="id_projet" className="block mb-1">ID Projet</label>
        <input
          type="number"
          id="id_projet"
          value={formData.id_projet}
          onChange={(e) => setFormData({ ...formData, id_projet: parseInt(e.target.value) })}
          className="w-full border p-2 rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="start_date" className="block mb-1">Date de début</label>
        <input
          type="date"
          id="start_date"
          value={formData.start_date}
          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="echeance" className="block mb-1">Échéance</label>
        <input
          type="date"
          id="echeance"
          value={formData.echeance}
          onChange={(e) => setFormData({ ...formData, echeance: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Modifier la tâche
      </button>
    </form>
  );
}