import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { clientsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';

function ClientModal({ isOpen, onClose, client, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: client || {},
  });

  React.useEffect(() => {
    if (isOpen) {
      reset(client || {});
    }
  }, [isOpen, client, reset]);

  const onFormSubmit = (data) => {
    onSubmit(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {client ? 'Редактировать клиента' : 'Добавить клиента'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Имя *</label>
            <input
              {...register('name', { required: 'Имя обязательно' })}
              className="input mt-1"
              placeholder="Введите имя клиента"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              {...register('email', {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Некорректный email',
                },
              })}
              type="email"
              className="input mt-1"
              placeholder="example@email.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Телефон</label>
            <input
              {...register('phone')}
              className="input mt-1"
              placeholder="+7 (999) 123-45-67"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Компания</label>
            <input
              {...register('company')}
              className="input mt-1"
              placeholder="Название компании"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Адрес</label>
            <textarea
              {...register('address')}
              className="input mt-1"
              rows="2"
              placeholder="Адрес клиента"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Комментарий</label>
            <textarea
              {...register('comment')}
              className="input mt-1"
              rows="3"
              placeholder="Дополнительная информация"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 btn btn-primary"
            >
              {client ? 'Обновить' : 'Создать'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn btn-secondary"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Clients() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const queryClient = useQueryClient();

  const { data: clients, isLoading } = useQuery(
    ['clients', search],
    () => clientsAPI.getClients({ search: search || undefined }),
    {
      keepPreviousData: true,
    }
  );

  const createMutation = useMutation(clientsAPI.createClient, {
    onSuccess: () => {
      queryClient.invalidateQueries('clients');
      toast.success('Клиент создан');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Ошибка создания клиента');
    },
  });

  const updateMutation = useMutation(
    ({ id, data }) => clientsAPI.updateClient(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clients');
        toast.success('Клиент обновлен');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Ошибка обновления клиента');
      },
    }
  );

  const deleteMutation = useMutation(clientsAPI.deleteClient, {
    onSuccess: () => {
      queryClient.invalidateQueries('clients');
      toast.success('Клиент удален');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Ошибка удаления клиента');
    },
  });

  const handleSubmit = (data) => {
    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этого клиента?')) {
      deleteMutation.mutate(id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и действия */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Клиенты</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Добавить клиента</span>
        </button>
      </div>

      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Поиск клиентов..."
          className="input pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Таблица клиентов */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Email</th>
                <th>Телефон</th>
                <th>Компания</th>
                <th>Дата создания</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  </td>
                </tr>
              ) : clients && clients.length > 0 ? (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="font-medium">{client.name}</td>
                    <td>{client.email || '-'}</td>
                    <td>{client.phone || '-'}</td>
                    <td>{client.company || '-'}</td>
                    <td>{new Date(client.created_at).toLocaleDateString('ru-RU')}</td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(client)}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
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
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    {search ? 'Клиенты не найдены' : 'Нет клиентов'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модальное окно */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={closeModal}
        client={editingClient}
        onSubmit={handleSubmit}
      />
    </div>
  );
}