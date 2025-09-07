import React from 'react';
import { useQuery } from 'react-query';
import { clientsAPI, dealsAPI, tasksAPI } from '../services/api';
import { Users, Briefcase, CheckSquare, TrendingUp } from 'lucide-react';

function StatCard({ title, value, icon: Icon, color, change }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {change && (
            <p className="text-sm text-green-600">
              <TrendingUp className="inline h-4 w-4 mr-1" />
              {change}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function RecentActivity({ title, items, emptyMessage }) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
      <div className="p-6">
        {items && items.length > 0 ? (
          <div className="space-y-4">
            {items.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-primary-600 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{item.title || item.name}</p>
                  <p className="text-xs text-gray-500">
                    {item.status && `Статус: ${item.status}`}
                    {item.amount && ` • ${item.amount} ₽`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">{emptyMessage}</p>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: clients } = useQuery('clients', () => clientsAPI.getClients({ limit: 1000 }));
  const { data: deals } = useQuery('deals', () => dealsAPI.getDeals({ limit: 1000 }));
  const { data: tasks } = useQuery('tasks', () => tasksAPI.getMyTasks({ limit: 1000 }));

  const stats = [
    {
      title: 'Всего клиентов',
      value: clients?.length || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Активные сделки',
      value: deals?.filter(deal => deal.status === 'in_progress').length || 0,
      icon: Briefcase,
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      title: 'Мои задачи',
      value: tasks?.filter(task => task.status !== 'done').length || 0,
      icon: CheckSquare,
      color: 'bg-yellow-500',
    },
    {
      title: 'Общая сумма сделок',
      value: deals?.reduce((sum, deal) => sum + (deal.amount || 0), 0).toLocaleString('ru-RU') + ' ₽' || '0 ₽',
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+15%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Недавняя активность */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity
          title="Последние клиенты"
          items={clients?.slice(-5).reverse()}
          emptyMessage="Клиенты не найдены"
        />
        <RecentActivity
          title="Активные сделки"
          items={deals?.filter(deal => deal.status === 'in_progress')}
          emptyMessage="Активные сделки не найдены"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity
          title="Мои задачи"
          items={tasks?.filter(task => task.status !== 'done')}
          emptyMessage="У вас нет активных задач"
        />
        <RecentActivity
          title="Завершенные сделки"
          items={deals?.filter(deal => deal.status === 'won')}
          emptyMessage="Завершенные сделки не найдены"
        />
      </div>
    </div>
  );
}