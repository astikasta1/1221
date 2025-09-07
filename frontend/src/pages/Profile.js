import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { usersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Shield, Calendar, Save } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const updateMutation = useMutation(
    (data) => usersAPI.updateUser(user.id, data),
    {
      onSuccess: (updatedUser) => {
        queryClient.setQueryData(['auth', 'me'], updatedUser);
        toast.success('Профиль обновлен');
        setIsEditing(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Ошибка обновления профиля');
      },
    }
  );

  const onSubmit = (data) => {
    updateMutation.mutate(data);
  };

  const handleCancel = () => {
    reset({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  const roleLabels = {
    admin: 'Администратор',
    manager: 'Менеджер',
    user: 'Пользователь',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Профиль пользователя</h2>
        </div>
        
        <div className="p-6">
          <div className="flex items-center space-x-6 mb-8">
            <div className="h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-primary-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{user?.name}</h3>
              <p className="text-gray-600">{user?.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Shield className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {roleLabels[user?.role] || user?.role}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-2" />
                  Имя
                </label>
                {isEditing ? (
                  <input
                    {...register('name', { required: 'Имя обязательно' })}
                    className="input"
                    placeholder="Введите ваше имя"
                  />
                ) : (
                  <div className="input bg-gray-50">
                    {user?.name}
                  </div>
                )}
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-2" />
                  Email
                </label>
                {isEditing ? (
                  <input
                    {...register('email', {
                      required: 'Email обязателен',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Некорректный email',
                      },
                    })}
                    type="email"
                    className="input"
                    placeholder="example@email.com"
                  />
                ) : (
                  <div className="input bg-gray-50">
                    {user?.email}
                  </div>
                )}
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Shield className="inline h-4 w-4 mr-2" />
                  Роль
                </label>
                <div className="input bg-gray-50">
                  {roleLabels[user?.role] || user?.role}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-2" />
                  Дата регистрации
                </label>
                <div className="input bg-gray-50">
                  {user?.created_at 
                    ? new Date(user.created_at).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '-'
                  }
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-secondary"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isLoading}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    <Save size={16} />
                    <span>
                      {updateMutation.isLoading ? 'Сохранение...' : 'Сохранить'}
                    </span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary"
                >
                  Редактировать
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Дополнительная информация */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Статистика</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {/* Здесь можно добавить статистику пользователя */}
                -
              </div>
              <div className="text-sm text-gray-600">Созданных сделок</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                -
              </div>
              <div className="text-sm text-gray-600">Выполненных задач</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                -
              </div>
              <div className="text-sm text-gray-600">Активных проектов</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}