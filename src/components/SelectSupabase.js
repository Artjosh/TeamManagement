import { createClient } from '@supabase/supabase-js';

function SelectSupabase({ setAfiliados, setEventos }) {
  const supabaseUrl = 'https://roijvfnoognumwjbyymt.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvaWp2Zm5vb2dudW13amJ5eW10Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3MzU4MjI5MiwiZXhwIjoxOTg5MTU4MjkyfQ.I77twttru16VK-OJ7t2P0FEegXZrj6lT_RDuShWxDkI';
  const supabase = createClient(supabaseUrl, supabaseKey);
  let subscription;

  const getAfiliadosByIdsBulk = async (ids) => {
    const { data, error } = await supabase
      .from('afiliados')
      .select('*')
      .in('id', ids.map((id) => String(id).trim()));
  
    if (error) {
      throw error;
    }
    
    return data;
  };
  
  async function getAfiliados() {
    const { data, error } = await supabase.from('afiliados').select('*');
    if (error) {
      throw error;
    }
    return data;
  }
  const getAfiliadosByIds = async (ids) => {
    const promises = ids.map(id => SelectSupabase().getAfiliadoById(id.trim()));
    const results = await Promise.all(promises);
    return results;
  };
  async function getAfiliadoById(id) {
    const { data, error } = await supabase
      .from('afiliados')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      throw error;
    }
    return data;
  }
  async function getEventos() {
    const { data, error } = await supabase.from('eventos').select('*');
    if (error) {
      throw error;
    }
    return data;
  }
  function handleEventoUpdate(updatedEvento) {
    setEventos((prevState) => {
      const updatedEventos = prevState.map((evento) => {
        if (evento.id === updatedEvento.id) {
          // Atualiza o evento com os novos dados
          return { ...evento, ...updatedEvento };
        }
        return evento;
      });
      return updatedEventos;
    });
  }  
  function handleEventoInsert(newEvento) {
    setEventos((prevState) => {
      // Verifica se o ID já existe na lista existente
      const eventoExists = prevState.some(
        (evento) => evento.id === newEvento.id
      );
      
      // Se o ID já existe, retorna a lista existente sem adicionar
      if (eventoExists) {
        return prevState;
      }
      
      // Se o ID não existe, adiciona  à lista existente
      return [...prevState, newEvento];
    });
  }
  function handleAfiliadoInsert(newAfiliado) {
    setAfiliados((prevState) => {
      // Verifica se o ID já existe na lista existente
      const afiliadoExists = prevState.some(
        (afiliado) => afiliado.id === newAfiliado.id
      );
      
      // Se o ID já existe, retorna a lista existente sem adicionar o novo afiliado
      if (afiliadoExists) {
        return prevState;
      }
      
      // Se o ID não existe, adiciona o novo afiliado à lista existente
      return [...prevState, newAfiliado];
    });
  }
  async function deleteEvento(eventoId) {
    const { error } = await supabase
      .from('eventos')
      .delete()
      .eq('id', eventoId);

    if (error) {
      throw error;
    }

    // Atualize o estado para refletir a exclusão do evento
    setEventos((prevState) => prevState.filter((evento) => evento.id !== eventoId));
  }
  function handleEventoDelete(deletedEventoId) {
  setEventos((prevState) =>
    prevState.filter((evento) => evento.id !== deletedEventoId)
  );
  }
  async function obterUrlPublica(nomeDoArquivo) {
    const { data, error } = supabase.storage
      .from('pfp')
      .getPublicUrl(nomeDoArquivo);
    if (error) {
      console.error(error);
      return null;
    }
    return data.publicUrl;
  }
  function subscribeToEventsInserts() {
    subscription = supabase
     .channel('table-db-changes')
     .on(
       'postgres_changes',
       {
         event: 'INSERT',
         schema: 'public',
         table: 'eventos',
       },
       (payload) => {
         console.log('Inserido:', payload);
         handleEventoInsert(payload.new);
         
       }
     )
     .subscribe();
  }
  function subscribeToAfiliadoInserts() {
     subscription = supabase
      .channel('table-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'afiliados',
        },
        (payload) => {
          console.log('Inserido:', payload);
          handleAfiliadoInsert(payload.new);
          
        }
      )
      .subscribe();
  }
  function subscribeToEventsUpdates() {
    subscription = supabase
      .channel('table-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'eventos',
        },
        (payload) => {
          console.log('Evento Atualizado:', payload);
          handleEventoUpdate(payload.new);
        }
      )
      .subscribe();
  }
  function subscribeToEventsDeletes() {
    subscription = supabase
      .channel('table-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'eventos',
        },
        (payload) => {
          console.log('Deletado:', payload);
          handleEventoDelete(payload.old.id);
        }
      )
      .subscribe();
  }  
  function unsubscribe() {
    if (subscription) {
      subscription.unsubscribe();
      subscription = null;
    }
  }
  return {
    subscribeToEventsUpdates,
    getAfiliados,
    subscribeToAfiliadoInserts,
    unsubscribe,
    getEventos,
    subscribeToEventsInserts,
    getAfiliadoById,
    getAfiliadosByIds,
    deleteEvento,
    subscribeToEventsDeletes,
    obterUrlPublica,
    getAfiliadosByIdsBulk
  };
}

export default SelectSupabase;
