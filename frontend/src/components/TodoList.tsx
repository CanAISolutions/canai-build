import { useState, useEffect } from 'react';
import { supabase, InitialPromptLog } from '../utils/supabase';

const TodoList = () => {
  const [prompts, setPrompts] = useState<InitialPromptLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPrompt, setNewPrompt] = useState('');

  const getPrompts = async () => {
    setLoading(true);
    setError(null);

    const { data: prompts, error } = await supabase
      .from('prompt_logs')
      .select('id, payload, created_at, user_id, trust_score')
      .order('created_at', { ascending: false }); // Show newest first

    if (error) {
      console.error('[Supabase] Error fetching prompt logs:', error);
      setError('Failed to load prompt logs');
      setLoading(false);
      return;
    }

    if (prompts && prompts.length > 0) {
      setPrompts(prompts);
    }
    setLoading(false);
  };

  const addPrompt = async (description: string) => {
    if (!description.trim()) return;

    const { error } = await supabase
      .from('prompt_logs')
      .insert([
        {
          payload: { description },
          user_id: null, // Will be set by RLS if user is authenticated
        },
      ])
      .select();

    if (error) {
      console.error('[Supabase] Error adding prompt:', error);
      setError('Failed to add prompt');
      return;
    }

    // Refresh the list
    await getPrompts();
    setNewPrompt(''); // Clear input
  };

  const deletePrompt = async (id: string) => {
    const { error } = await supabase.from('prompt_logs').delete().eq('id', id);

    if (error) {
      console.error('[Supabase] Error deleting prompt:', error);
      setError('Failed to delete prompt');
      return;
    }

    // Refresh the list
    await getPrompts();
  };

  useEffect(() => {
    getPrompts();

    // Set up real-time subscription
    const subscription = supabase
      .channel('prompt_logs_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prompt_logs' },
        () => {
          console.log('[Supabase] Real-time update received');
          getPrompts();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPrompt(newPrompt);
  };

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Prompt Logs (Todos)</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading prompt logs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Prompt Logs (Todos)</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      {/* Add new prompt form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newPrompt}
            onChange={e => setNewPrompt(e.target.value)}
            placeholder="Enter a new prompt description..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Prompt
          </button>
        </div>
      </form>

      {/* Prompt list */}
      {prompts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No prompt logs found.</p>
          <p className="text-sm mt-2">Add a new prompt above to get started!</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {prompts.map(prompt => (
            <li
              key={prompt.id}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <p className="text-gray-900">
                  {prompt.payload?.['description'] || 'No description'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Created: {new Date(prompt.created_at).toLocaleString()}
                  {prompt.user_id && ` | User: ${prompt.user_id}`}
                  {prompt.trust_score && ` | Trust: ${prompt.trust_score}`}
                </p>
              </div>
              <button
                onClick={() => deletePrompt(prompt.id)}
                className="ml-4 px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                title="Delete prompt"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Debug info */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Debug Info:
        </h3>
        <p className="text-xs text-gray-600">
          Total prompts: {prompts.length} | Real-time updates: Active | Table:
          prompt_logs
        </p>
      </div>
    </div>
  );
};

export default TodoList;
