import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { tasksAPI, usersAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Search, X, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const statusOptions = [
  { value: 'todo', label: 'К выполнению', color: 'bg-gray-100 text-gray-800' },
  { value: 'in_progress', label: 'В работе', color: 'bg-blue-100 text-blue-800' },
  { value: 'done', label: 'Выполнено', color: 'bg-green-100 text-green-800' },
];

function StatusBadge({ status }) {
  const statusConfig = statusOptions.find(opt => opt.value === status);
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusConfig?.color}`}>
      {statusConfig?.label}
    </span>
  );
}

function TaskModal({ isOpen, onClose, task, onSubmit }) {
  const { data: users } = useQuery('users', () => usersAPI.getUsers({ limit: 1000 }));

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: task || { status: 'todo' },
  });

  React.useEffect(() => {
    if (isOpen) {
      const defaultValues = task || { status: 'todo' };
      if (task?.deadline) {
        defaultValues.deadline = format(new Date(task.deadline), 'yyyy-MM-dd\'T\'HH:mm');
      }
      reset(defaultValues);
    }
  }, [isOpen, task, reset]);

  const onFormSubmit = (data) => {
    onSubmit({
      ...data,
      assigned_user_id: parseInt(data.assigned_user_id),
      deadline: data.deadline ? new Date(data.deadline).toISOString() : null,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {task ? 'Редактировать задачу' : 'Добавить задачу'}
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
              placeholder="Введите название задачи"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Исполнитель *</label>
            <select
              {...register('assigned_user_id', { required: 'Выберите исполнителя' })}
              className="input mt-1"
            >
              <option value="">Выберите исполнителя</option>
              {users?.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
            {errors.assigned_user_id && <p className="text-red-500 text-xs mt-1">{errors.assigned_user_id.message}</p>}
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
            <label className="block text-sm font-medium text-gray-700">Дедлайн</label>
            <input
              {...register('deadline')}
              type="datetime-local"
              className="input mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Описание</label>
            <textarea
              {...register('description')}
              className="input mt-1"
              rows="4"
              placeholder="Описание задачи"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="submit" className="flex-1 btn btn-primary">
              {task ? 'Обновить' : 'Создать'}
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

export default function Tasks() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showMyTasks, setShowMyTasks] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery(
    ['tasks', search, statusFilter, showMyTasks],
    () => {
      const params = {
        search: search || undefined,
        status: statusFilter || undefined
      };
      return showMyTasks ? tasksAPI.getMyTasks(params) : tasksAPI.getTasks(params);
    },
    { keepPreviousData: true }
  );

  const createMutation = useMutation(tasksAPI.createTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
      toast.success('Задача создана');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Ошибка создания задачи');
    },
  });

  const updateMutation = useMutation(
    ({ id, data }) => tasksAPI.updateTask(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tasks');
        toast.success('Задача обновлена');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Ошибка обновления задачи');
      },
    }
  );

  const deleteMutation = useMutation(tasksAPI.deleteTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
      toast.success('Задача удалена');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Ошибка удаления задачи');
    },
  });

  const handleSubmit = (data) => {
    if (editingTask) {
      updateMutation.mutate({ id: editingTask.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      deleteMutation.mutate(id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const isOverdue = (deadline) => {
    return deadline && new Date(deadline) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Задачи</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Добавить задачу</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Поиск задач..."
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
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showMyTasks}
            onChange={(e) => setShowMyTasks(e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-700">Только мои задачи</span>
        </label>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Исполнитель</th>
                <th>Статус</th>
                <th>Дедлайн</th>
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
              ) : tasks && tasks.length > 0 ? (
                tasks.map((task) => (
                  <tr key={task.id} className={`hover:bg-gray-50 ${isOverdue(task.deadline) && task.status !== 'done' ? 'bg-red-50' : ''}`}>
                    <td className="font-medium">
                      {task.title}
                      {task.description && (
                        <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                          {task.description}
                        </p>
                      )}
                    </td>
                    <td>{task.assigned_user?.name || '-'}</td>
                    <td><StatusBadge status={task.status} /></td>
                    <td>
                      {task.deadline ? (
                        <div className={`flex items-center space-x-1 ${isOverdue(task.deadline) && task.status !== 'done' ? 'text-red-600' : ''}`}>
                          <Calendar size={14} />
                          <span className="text-sm">
                            {format(new Date(task.deadline), 'dd.MM.yyyy HH:mm', { locale: ru })}
                          </span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>{new Date(task.created_at).toLocaleDateString('ru-RU')}</td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(task)}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
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
                    {search || statusFilter ? 'Задачи не найдены' : 'Нет задач'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={closeModal}
        task={editingTask}
        onSubmit={handleSubmit}
      />
    </div>
  );
}