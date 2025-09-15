import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, GraduationCap, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../config/supabase';
import type { Person, Order } from '../types';

const MakeOrder: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [orders, setOrders] = useState<Partial<Order>[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPeople();
    loadStoredOrders();
  }, []);

  const loadPeople = async () => {
    try {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading people:', error);
        // Use sample data if database is not set up
        setSampleData();
      } else {
        setPeople(data || []);
        if (data?.length === 0) {
          setSampleData();
        }
      }
    } catch (err) {
      console.error('Database connection error:', err);
      setSampleData();
    } finally {
      setLoading(false);
    }
  };

  const setSampleData = () => {
    const samplePeople: Person[] = [
      {
        id: '1',
        name: 'Ana María González',
        photo: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300',
        category: 'student',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Carlos Rodríguez',
        photo: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300',
        category: 'student',
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'María José Silva',
        photo: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=300',
        category: 'student',
        created_at: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Prof. Roberto Jiménez',
        photo: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300',
        category: 'teacher',
        created_at: new Date().toISOString()
      },
      {
        id: '5',
        name: 'Prof. Carmen Vargas',
        photo: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=300',
        category: 'teacher',
        created_at: new Date().toISOString()
      }
    ];
    setPeople(samplePeople);
  };

  const loadStoredOrders = () => {
    const stored = localStorage.getItem('currentOrders');
    if (stored) {
      setOrders(JSON.parse(stored));
    }
  };

  const getOrderStatus = (personId: string) => {
    const order = orders.find(o => o.person_id === personId);
    if (!order) return 'pending';
    if (order.fruit_or_soup === null && order.juice_or_lemonade === null && order.main_dish === null) {
      return 'no-meal';
    }
    return 'ordered';
  };

  const students = people.filter(p => p.category === 'student');
  const teachers = people.filter(p => p.category === 'teacher');

  const allOrdersComplete = people.length > 0 && people.every(person => 
    orders.some(order => order.person_id === person.id)
  );

  const handleContinueToSummary = () => {
    localStorage.setItem('currentOrders', JSON.stringify(orders));
    navigate('/order-summary');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-2xl text-gray-600">Cargando personas...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Hacer Pedido de Almuerzo</h1>
        <p className="text-xl text-gray-600">
          Selecciona cada persona para configurar su pedido
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8 bg-white rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-700">
            Progreso: {orders.length} de {people.length} personas
          </span>
          <div className="flex space-x-2">
            <div className="flex items-center space-x-1">
              <CheckCircle size={20} className="text-green-500" />
              <span className="text-sm">Con pedido</span>
            </div>
            <div className="flex items-center space-x-1">
              <XCircle size={20} className="text-red-500" />
              <span className="text-sm">Sin almuerzo</span>
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
          <div
            className="bg-gradient-to-r from-[#41BAAE] to-[#BADA55] h-3 rounded-full transition-all duration-300"
            style={{ width: `${people.length > 0 ? (orders.length / people.length) * 100 : 0}%` }}
          ></div>
        </div>
      </div>

      {/* Students Section */}
      {students.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <User size={32} className="mr-3 text-[#41BAAE]" />
            <h2 className="text-3xl font-bold text-gray-800">Estudiantes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((person) => {
              const status = getOrderStatus(person.id);
              return (
                <Link
                  key={person.id}
                  to={`/order-options/${person.id}`}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-[#41BAAE] relative"
                >
                  {status === 'ordered' && (
                    <CheckCircle 
                      size={32} 
                      className="absolute top-4 right-4 text-green-500 bg-white rounded-full" 
                    />
                  )}
                  {status === 'no-meal' && (
                    <XCircle 
                      size={32} 
                      className="absolute top-4 right-4 text-red-500 bg-white rounded-full" 
                    />
                  )}
                  <div className="text-center">
                    <img
                      src={person.photo}
                      alt={person.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-[#BADA55]"
                    />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{person.name}</h3>
                    <div className="text-sm text-gray-500 mb-3">Estudiante</div>
                    {status === 'ordered' && (
                      <div className="text-green-600 font-semibold">✓ Pedido realizado</div>
                    )}
                    {status === 'no-meal' && (
                      <div className="text-red-600 font-semibold">✗ Sin almuerzo</div>
                    )}
                    {status === 'pending' && (
                      <div className="text-gray-500">Pendiente</div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Teachers Section */}
      {teachers.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <GraduationCap size={32} className="mr-3 text-[#BADA55]" />
            <h2 className="text-3xl font-bold text-gray-800">Profesores</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((person) => {
              const status = getOrderStatus(person.id);
              return (
                <Link
                  key={person.id}
                  to={`/order-options/${person.id}`}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-[#BADA55] relative"
                >
                  {status === 'ordered' && (
                    <CheckCircle 
                      size={32} 
                      className="absolute top-4 right-4 text-green-500 bg-white rounded-full" 
                    />
                  )}
                  {status === 'no-meal' && (
                    <XCircle 
                      size={32} 
                      className="absolute top-4 right-4 text-red-500 bg-white rounded-full" 
                    />
                  )}
                  <div className="text-center">
                    <img
                      src={person.photo}
                      alt={person.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-[#41BAAE]"
                    />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{person.name}</h3>
                    <div className="text-sm text-gray-500 mb-3">Profesor</div>
                    {status === 'ordered' && (
                      <div className="text-green-600 font-semibold">✓ Pedido realizado</div>
                    )}
                    {status === 'no-meal' && (
                      <div className="text-red-600 font-semibold">✗ Sin almuerzo</div>
                    )}
                    {status === 'pending' && (
                      <div className="text-gray-500">Pendiente</div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Continue Button */}
      {allOrdersComplete && (
        <div className="text-center">
          <button
            onClick={handleContinueToSummary}
            className="bg-gradient-to-r from-[#41BAAE] to-[#BADA55] text-white px-12 py-6 rounded-2xl text-2xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-4 mx-auto"
          >
            <span>Ver Resumen del Pedido</span>
            <ArrowRight size={32} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MakeOrder;