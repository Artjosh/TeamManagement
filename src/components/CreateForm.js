import React, { useState, useEffect, useCallback } from 'react';
import AfiliadoEvent from './AfiliadoEvent';
import './Createform.css';
import InsertSupabase from './InsertSupabase';
import Mapa from './Mapa'
import SelectSupabase from './SelectSupabase';

  function CreateForm({ setShowForm, selectedItem, setSelectedItem }) {

    const [endereco, setEndereco] = useState(selectedItem ? selectedItem.endereco : '');
    const [lat, setLat] = useState('-30.042399707172002');
    const [long, setLong] = useState('-51.134700155904326');
    const [contratante, setContratante] = useState(selectedItem ? selectedItem.nomecontratante : '');
    const [pessoas, setPessoas] = useState(selectedItem ? selectedItem.numeropessoas : '');
    const [celularContratante, setCelularContratante] = useState(selectedItem ? selectedItem.numerocontratante : '');
    const [celular2Contratante, setCelular2Contratante] = useState(selectedItem ? selectedItem.numeroextracontratante : '');
    const [forno, setForno] = useState([]);
    const [garcons, setGarcons] = useState([]);
    const [dia, setDia] = useState(selectedItem ? selectedItem.dia : '');
    const [hora, setHora] = useState(selectedItem ? selectedItem.hora : '');
    const adicionais = ['Bebidas', 'Pasteis'];
    const [showModal, setshowModal] = useState(false);
    const [f, setF] = useState([]);
    const [fornosConfirmados, setFornosConfirmados] = useState([]);
    const [garconsConfirmados, setGarconsConfirmados] = useState([]);

    const handleSubmit = async (e) => {
      e.preventDefault(e);
      /* console.log(f) */
      const afiliados = {
        forno: forno,
        garcons: garcons
      };
      const confirmados = {
        forno:  fornosConfirmados,
        garcons:  garconsConfirmados
      };
      const novoEvento = {
        contratante,
        endereco,        
        pessoas,
        celularContratante,
        celular2Contratante,
        afiliados,
        dia,
        hora,
        confirmados
      };
      InsertSupabase()
        .insertEvento(novoEvento)
        .then(() => {
          // Exibe mensagem de aviso na tela
          const message = document.createElement('div');
          message.innerText = 'Evento inserido com sucesso!';
          message.classList.add('success-message');
          document.body.appendChild(message);        
          // Remove mensagem de aviso e limpa campos após 2 segundos
          setTimeout(() => {
            document.body.removeChild(message);
            setShowForm(false);
            setSelectedItem(null);
          }, 2000);
        })
        .catch((error) => {
          console.error(error);
          // Exibe mensagem de erro na tela
          const message = document.createElement('div');
          message.innerText = 'Erro ao inserir evento';
          message.classList.add('error-message');
          document.body.appendChild(message);
          setTimeout(() => {
            document.body.removeChild(message);
          }, 2000);
        });

        for (const id of forno.join(',').split(',')) {
          SelectSupabase({ setAfiliados: 1 })
            .getAfiliadoById(id.trim())
            .then((result) => {
              const { id, nome, numero } = result;
              console.log(`id: ${id}, nome: ${nome}, numero: ${numero}`);
              const data = {
                numero: `${numero}@c.us`,
                mensagem: `👋 Olá, ${nome}! Te convidaram para um evento 💰 💰`,
              };
              // Configura a opção da requisição
              const options = {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
              };
              fetch('https://1647-18-230-24-247.ngrok-free.app/afiliadoaddeventomsg', options)
                .then((response) => {
                  console.log(response);
                })
                .catch((error) => {
                  console.error(error);
                });
            })
            .catch((error) => {
              console.error(error);
            });
        }
        for (const id of garcons.join(',').split(',')) {
          SelectSupabase({ setAfiliados: 1 })
            .getAfiliadoById(id.trim())
            .then((result) => {
              const { nome, numero } = result;
              const data = {
                numero: `${numero}@c.us`,
                mensagem: `👋 Olá, ${nome}! Te convidaram para um evento 💰 💰 `,
              };
              // Configura a opção da requisição
              const options = {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
              };
              fetch('https://1647-18-230-24-247.ngrok-free.app/afiliadoaddeventomsg', options)
                .then((response) => {
                  console.log(response);
                })
                .catch((error) => {
                  console.error(error);
                });
            })
            .catch((error) => {
              console.error(error);
            });
        }
    };
    useEffect(() => {
      const escFunction = (event) => {
        if (event.keyCode === 27) {

          setShowForm(false);
          setSelectedItem(null);
        }
      };
      document.addEventListener('keydown', escFunction, false);
      return () => {
        document.removeEventListener('keydown', escFunction, false);
      };
    }, [fornosConfirmados, selectedItem, setSelectedItem, setShowForm]);
    useEffect(() => {
      if (!dia || !hora) {
        setshowModal(true);
      } else {
        setshowModal(false);
      }
    }, [dia, hora]);
    const carregarCordenadas = useCallback(async () => {
      const endereco2 = encodeURIComponent(
        endereco + "Porto Alegre, Rio Grande do Sul, Brazil"
      );
      const api_url = `https://api.geoapify.com/v1/geocode/search?text=${endereco2}&apiKey=f823c046cabf44b4aa95ee616599ba9a`;
    
      try {
        const response = await fetch(api_url);
        const data = await response.json();
        return { lat: data.features[0].properties.lat, lon: data.features[0].properties.lon };
      } catch (error) {
        console.log(error);
      }
    }, [endereco]);
    useEffect(() => {
      if (selectedItem) {
        carregarCordenadas().then((coords) => {
          setLat(coords.lat);
          setLong(coords.lon);
        });
      }
      else if(endereco !== ''){
        carregarCordenadas().then((coords) => {
          setLat(coords.lat);
          setLong(coords.lon);
        });
      }
    }, [selectedItem, carregarCordenadas, endereco]);
    useEffect(() => {
      if (selectedItem) {
        const confirmados = JSON.parse(selectedItem.confirmados);
        const pending = JSON.parse(selectedItem.pending);
    
        const fornosConfirmadosIds = confirmados.forno;
        const fornosPendingIds = pending.forno;
        const garconsConfirmadosIds = confirmados.garcons;
        const garconsPendingIds = pending.garcons;
        
        setFornosConfirmados(fornosConfirmadosIds ? fornosConfirmadosIds : []);
        setForno(fornosPendingIds ? fornosPendingIds : []);
        setGarconsConfirmados(garconsConfirmadosIds ? garconsConfirmadosIds : []);
        setGarcons(garconsPendingIds ? garconsPendingIds : []);
      }
    }, [selectedItem]);    
  return (
    <div className="form-container" >
        <form className='eventform'>
          <div className='autocomplete-container' id='autocomplete'>          
          <input required className='bigerinput' type="text" placeholder='Endereço' value={endereco} onChange={e =>setEndereco(e.target.value)} />
          <input required type="text" placeholder="Nome do contratante" value={contratante} onChange={e => setContratante(e.target.value)} />
          <input required type="number" placeholder="Número de pessoas" onInput={(event) => {
            const value = event.target.value.replace(/\D/g, ''); // remove todos os caracteres não numéricos
            event.target.value = value;}} value={pessoas} onChange={e => setPessoas(e.target.value)} />
          <input required type="tel" placeholder="Numero contratante" value={celularContratante}  onChange={e => setCelularContratante(e.target.value)} />
          <input required type="tel" placeholder="Numero alternativo" value={celular2Contratante} onChange={e => setCelular2Contratante(e.target.value)} />
          <input required className="smallinput" type="date" placeholder="Dia" value={dia} onChange={e => setDia(e.target.value)} />
          <input required className="smallinput" type="time" placeholder="Horario" value={hora} onChange={e => setHora(e.target.value)} />
          
          
          {adicionais.map((adicional, index) => (
            <React.Fragment key={index}>
              <label style={{ marginLeft:'2px' }} htmlFor={adicional}>{adicional}</label>
              <input type="checkbox" style={{ width:'25px' }}  id={adicional} name={adicional} value={adicional} />
            </React.Fragment>
          ))}
           
      <div className='body'>
        <AfiliadoEvent className='Forno' fornosConfirmados={fornosConfirmados} fornosPending={forno} f={f} onChange2={e => setF(prevForno => [...prevForno, e.target.value])} onChange={e => setForno(prevForno => [...prevForno, e.target.value])} test={showModal} dia={dia} hora={hora}/>
        <AfiliadoEvent className='Garçons' garconsConfirmados={garconsConfirmados} garconsPending={garcons} f={f} onChange2={e => setF(prevForno => [...prevForno, e.target])} onChange={e => setGarcons(prevGarcons => [...prevGarcons, e.target.value])} test={showModal} dia={dia} hora={hora}/>
        </div>
      </div>      
      </form><Mapa lat={lat} lng={long} zoom={18}></Mapa>
      {selectedItem ? (<button className='sendForm' type="submit" onClick={handleSubmit}>Salvar</button> ) : (<button className='sendForm' type="submit" onClick={handleSubmit}>Enviar</button> )}      
      </div>
      )}
export default CreateForm;



