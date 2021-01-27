import React, { useContext, useEffect } from 'react'
import { SocketContext } from '../context/SocketContext';
import { useMap } from '../hooks/useMap';

const puntoInicial = {
    lng: -76.5477,
    lat: 3.4001,
    zoom: 17,
};

const MapaPage = () => {

    const { coords, setRef, nuevoMarcador$, movimientoMarcador$, agregarMarcador, actualizarPosicion } = useMap(puntoInicial);
    const {socket} = useContext(SocketContext);

    // escuchar los marcadores existentes
    useEffect(() => {
        socket.on('marcadores-activos', (marcadores) => {
            
            for(const key of Object.keys(marcadores)){
                agregarMarcador(marcadores[key], key)
            }

        })
    }, [agregarMarcador, socket])


    // nuevo marcador
    useEffect(() => {
        
        nuevoMarcador$.subscribe( marcador => {
            socket.emit('macador-nuevo', marcador )
        });

    }, [nuevoMarcador$, socket]);

    // movimientos del marcador
    useEffect(() => {
        
        movimientoMarcador$.subscribe( moviento => {
            socket.emit('marcador-actualizado', moviento);
        })

    }, [movimientoMarcador$, socket]);

    // mover marcador mediante sockets
    useEffect(() => {
        socket.on('marcador-actualizado', (marcador) => {
            actualizarPosicion(marcador);
        })
    }, [socket, actualizarPosicion])

    // escuchar nuevos marcadores
    useEffect(() => {
        socket.on('macador-nuevo', (marcador) => {
            agregarMarcador(marcador, marcador.id)
        })
    }, [socket, agregarMarcador])

    return (
        <>

        <div className="info">
            Lng: {coords.lng} | Lat: {coords.lat} | Zoom: {coords.zoom}
        </div>

        <div ref={setRef} className="mapContainer"/>

            
        </>
    )
}

export default MapaPage
