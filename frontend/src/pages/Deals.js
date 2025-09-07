import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { dealsAPI, clientsAPI, usersAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';

const statusOptions = [
  { value: 'new', label: 'Новая', color: 'bg-blue-100 text-blue-800' },
  { value: 'in_progress', label: 'В работе', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'won', label: 'Выиграна', color: 'bg-green-100 text-green-800' },
  { value: 'lost', label: 'Проиграна', color: 'bg-red-100 text-red-800' },
];

function StatusBadge({ status }) {
  const statusConfig = statusOptions.find(opt => opt.value === status);
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusConfig?.color}`}>
      {statusConfig?.label}
    </span>
  );
}

function DealModal({ isOpen, onClose, deal, onSubmit }) {
  const { data: clients } = useQuery('clients', () => clientsAPI.getClients({ limit: 1000 }));
  const { data: managers } = useQuery('managers', usersAPI.getManagers);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: deal || { status: 'new', amount: 0 },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset(deal || { status: 'new', amount: 0 });
    }
  }, [isOpen, deal, reset]);

  const onFormSubmit = (data) => {
    onSubmit({
      ...data,
      amount: parseFloat(data.amount) || 0,
      client_id: parseInt(data.client_id),
      manager_id: parseInt(data.manager_id),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {deal ? 'Редактировать сделку' : 'Добавить сделку'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Название *</label>
            <input
              {...register('title', { required: 'Название обязательно' })}
              className="input mt-1"
              placeholder="Введите название сделки"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Клиент *</label>
            <select
              {...register('client_id', { required: 'Выберите клиента' })}
              className="input mt-1"
            >
              <option value="">Выберите клиента</option>
              {clients?.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} {client.company && `(${client.company})`}
                </option>
              ))}
            </select>
            {errors.client_id && <p className="text-red-500 text-xs mt-1">{errors.client_id.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Менеджер *</label>
            <select
              {...register('manager_id', { required: 'Выберите менеджера' })}
              className="input mt-1"
            >
              <option value="">Выберите менеджера</option>
              {managers?.map(manager => (
                <option key={manager.id} value={manager.id}>
                  {manager.name} ({manager.role})
                </option>
              ))}
            </select>
            {errors.manager_id && <p className="text-red-500 text-xs mt-1">{errors.manager_id.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Сумма</label>
            <input
              {...register('amount')}
              type="number"
              step="0.01"
              min="0"
              className="input mt-1"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Статус</label>
            <select
              {...register('status')}
              className="input mt-1"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Описание</label>
            <textarea
              {...register('description')}
              className="input mt-1"
              rows="3"
              placeholder="Описание сделки"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="submit" className="flex-1 btn btn-primary">
              {deal ? 'Обновить' : 'Создать'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 btn btn-secondary">
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Deals() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const queryClient = useQueryClient();

  const { data: deals, isLoading } = useQuery(
    ['deals', search, statusFilter],
    () => dealsAPI.getDeals({ 
      search: search || undefined,
      status: statusFilter || undefined
    }),
    { keepPreviousData: true }
  );

  const createMutation = useMutation(dealsAPI.createDeal, {
    onSuccess: () => {
      queryClient.invalidateQueries('deals');
      toast.success('Сделка создана');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Ошибка создания сделки');
    },
  });

  const updateMutation = useMutation(
    ({ id, data }) => dealsAPI.updateDeal(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('deals');
        toast.success('Сделка обновлена');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Ошибка обновления сделки');
      },
    }
  );

  const deleteMutation = useMutation(dealsAPI.deleteDeal, {
    onSuccess: () => {
      queryClient.invalidateQueries('deals');
      toast.success('Сделка удалена');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Ошибка удаления сделки');
    },
  });

  const handleSubmit = (data) => {
    if (editingDeal) {
      updateMutation.mutate({ id: editingDeal.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (deal) => {
    setEditingDeal(deal);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту сделку?')) {
      deleteMutation.mutate(id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDeal(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Сделки</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Добавить сделку</span>
        </button>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Поиск сделок..."
            className="input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-48"
        >
          <option value="">Все статусы</option>
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Клиент</th>
                <th>Менеджер</th>
                <th>Сумма</th>
                <th>Статус</th>
                <th>Дата создания</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  </td>
                </tr>
              ) : deals && deals.length > 0 ? (
                deals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-gray-50">
                    <td className="font-medium">{deal.title}</td>
                    <td>{deal.client?.name || '-'}</td>
                    <td>{deal.manager?.name || '-'}</td>
                    <td>{deal.amount?.toLocaleString('ru-RU')} ₽</td>
                    <td><StatusBadge status={deal.status} /></td>
                    <td>{new Date(deal.created_at).toLocaleDateString('ru-RU')}</td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(deal)}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(deal.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    {search || statusFilter ? 'Сделки не найдены' : 'Нет сделок'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DealModal
        isOpen={isModalOpen}
        onClose={closeModal}
        deal={editingDeal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}