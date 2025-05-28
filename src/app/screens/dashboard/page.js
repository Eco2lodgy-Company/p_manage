'use client';
import React from 'react';
import { Pie, PieChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PlusCircle, ChevronDown } from 'lucide-react';

export default function Dashboard() {
  // Pie Chart Data for "Répartition département"
  const chartData = [
    { status: 'R&D', nombre: 48, fill: 'var(--chart-1)' },
    { status: 'Marketing', nombre: 30, fill: 'var(--chart-2)' },
    { status: 'Finance', nombre: 20, fill: 'var(--chart-3)' },
  ];

  const chartConfig = {
    nombre: { label: 'Nombre' },
    'R&D': { label: 'R&D', color: 'var(--chart-1)' },
    Marketing: { label: 'Marketing', color: 'var(--chart-2)' },
    Finance: { label: 'Finance', color: 'var(--chart-3)' },
  };

  const totalNombre = chartData.reduce((acc, curr) => acc + curr.nombre, 0);

  // Mocked data for "Activités récentes" and "Tâches à venir"
  const recentActivities = [
    { name: 'Rapport de projet mis à jour', color: 'border-l-chart-1' },
    { name: 'Tâche complétée: Design de l’interface', color: 'border-l-chart-2' },
    { name: 'Il y a 2 heures par Sophie M.', color: 'border-l-chart-3' },
    { name: 'Il y a 5 heures par Mario C.', color: 'border-l-destructive' },
    { name: 'Alerte: Budget dépassé pour le projet Eco-Build', color: 'border-l-destructive' },
  ];

  const upcomingTasks = [
    { name: 'Finaliser le rapport mensuel', due: 'Aujourd’hui' },
    { name: 'Réunion avec les investisseurs', due: '14/10/2025' },
    { name: 'Révision du plan marketing', due: '15/10/2025' },
    { name: 'Formation équipe développement', due: '10/10/2025' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:ml-64 lg:ml-64 xl:ml-64">
      {/* Header */}
      <div className="fixed top-0 left-0 md:left-64 lg:left-64 xl:left-64 right-0 bg-background text-foreground p-4 shadow-md z-10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Eco-Build SA</span>
          <ChevronDown className="h-4 w-4" />
        </div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">Tous les départements</span>
            <ChevronDown className="h-4 w-4" />
          </div>
          <button className="bg-primary text-primary-foreground px-3 py-1 rounded-lg text-sm">
            Exporter
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm">Admin</span>
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Top Cards */}
      <div className="mt-16 p-4 flex flex-wrap justify-between gap-4">
        <div className="bg-card text-card-foreground p-4 rounded-lg shadow-md text-center border-l-4 border-l-chart-1 w-full sm:w-[48%] md:w-[23%]">
          <h2 className="text-lg font-bold">Projets actifs</h2>
          <p className="text-3xl font-bold">12</p>
          <p className="text-sm text-muted-foreground">+4% par rapport au dernier mois</p>
        </div>
        <div className="bg-card text-card-foreground p-4 rounded-lg shadow-md text-center border-l-4 border-l-chart-2 w-full sm:w-[48%] md:w-[23%]">
          <h2 className="text-lg font-bold">Tâches en cours</h2>
          <p className="text-3xl font-bold">42</p>
          <p className="text-sm text-muted-foreground">-3% par rapport au dernier mois</p>
        </div>
        <div className="bg-card text-card-foreground p-4 rounded-lg shadow-md text-center border-l-4 border-l-chart-3 w-full sm:w-[48%] md:w-[23%]">
          <h2 className="text-lg font-bold">Employés</h2>
          <p className="text-3xl font-bold">85</p>
          <p className="text-sm text-muted-foreground">+12% par rapport au dernier mois</p>
        </div>
        <div className="bg-card text-card-foreground p-4 rounded-lg shadow-md text-center border-l-4 border-l-chart-4 w-full sm:w-[48%] md:w-[23%]">
          <h2 className="text-lg font-bold">Budget utilisé</h2>
          <p className="text-3xl font-bold">68%</p>
          <div className="w-full bg-muted h-2 rounded-full mt-2">
            <div className="bg-chart-4 h-2 rounded-full" style={{ width: '68%' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 flex flex-row flex-wrap justify-around gap-4">
        {/* Left Column */}
        <div className="flex flex-col w-full md:w-[48%] gap-4">
          {/* Progress Chart Placeholder */}
          <div className="bg-card text-card-foreground shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Progression des projets</h2>
              <select className="bg-muted text-muted-foreground rounded px-2 py-1 text-sm">
                <option>Dernier mois</option>
                <option>Ce mois</option>
                <option>Dernière année</option>
              </select>
            </div>
            <div className="flex justify-between text-muted-foreground text-sm mt-4">
              <span>Lun</span>
              <span>Mar</span>
              <span>Mer</span>
              <span>Jeu</span>
              <span>Sam</span>
            </div>
            <div className="h-40 bg-muted rounded mt-2 flex items-center justify-center">
              <p className="text-muted-foreground">[Line Chart Placeholder]</p>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-card text-card-foreground shadow-md rounded-lg p-6">
            <h2 className="text-xl font-bold">Activités récentes</h2>
            <div className="flex flex-col space-y-4 mt-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className={`flex items-center p-3 rounded-lg border-l-4 ${activity.color}`}
                >
                  <span className="text-sm text-card-foreground">{activity.name}</span>
                </div>
              ))}
            </div>
            <button className="mt-4 flex items-center gap-2 text-primary hover:underline text-sm">
              Voir tout
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col w-full md:w-[48%] gap-4">
          {/* Pie Chart */}
          <div className="bg-card text-card-foreground shadow-md rounded-lg p-6">
            <h2 className="text-xl font-bold text-center">Répartition département</h2>
            <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px] mt-4">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={chartData}
                  dataKey="nombre"
                  nameKey="status"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {totalNombre}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground text-sm"
                            >
                              Total
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {chartData.map((item) => (
                <div key={item.status} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: chartConfig[item.status].color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {chartConfig[item.status].label} ({item.nombre}%)
                  </span>
                </div>
              ))}
            </div>
            <button className="mt-4 flex items-center gap-2 text-primary hover:underline text-sm mx-auto">
              Voir tout
            </button>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-card text-card-foreground shadow-md rounded-lg p-6">
            <h2 className="text-xl font-bold">Tâches à venir</h2>
            <div className="flex flex-col space-y-4 mt-4">
              {upcomingTasks.map((task, index) => (
                <div
                  key={index}
                  className="flex flex-row justify-between p-3 rounded-lg border-l-4 border-l-chart-1"
                >
                  <span className="text-sm text-card-foreground">{task.name}</span>
                  <span className="text-sm text-muted-foreground">Échéance: {task.due}</span>
                </div>
              ))}
            </div>
            <button className="mt-4 flex items-center gap-2 text-primary hover:underline text-sm">
              <PlusCircle className="h-4 w-4" /> Ajouter une tâche
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}