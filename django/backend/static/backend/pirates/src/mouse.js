/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   mouse.js                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: plopez-b <plopez-b@student.42malaga.com    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2024/06/10 02:35:23 by plopez-b          #+#    #+#             */
/*   Updated: 2024/06/10 02:35:23 by plopez-b         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {EventDispatcher, Vector3, Raycaster} from "three";

export class Mouse extends EventDispatcher
{

    constructor(view)
    {
        super();
        this.view = view;
        this.selected_cell = null;
        document.addEventListener(
            'mousemove', (o) => this.on_mouse_move(o));
        document.addEventListener(
            'click', (o) => this.on_left_click(o));
        document.addEventListener(
            'contextmenu', (o) => this.on_right_click(o));
    }

    on_mouse_move(event)
    {
        let mouse3D = new Vector3(
            (event.clientX / window.innerWidth) * 2 - 1,   
            -(event.clientY / window.innerHeight) * 2 + 1,  
            0.5 );
        let raycaster = new Raycaster();                                        
        raycaster.setFromCamera(mouse3D, this.view.camera);
        let intersects = raycaster.intersectObjects(
            this.view.cells, true);
        if (intersects.length > 0)
        {
            let selected = intersects[0].object;
            if (selected != this.selected_cell)
            {
                if (this.selected_cell != null)
                {
                    this.dispatchEvent(
                        {type: 'hover_leave', cell: this.selected_cell});
                }
                this.dispatchEvent(
                    {type: 'hover_enter', cell: selected});
                this.selected_cell = selected;
            }
        }
        else if (this.selected_cell != null)
        {
            this.dispatchEvent({
                type: 'hover_leave', cell: this.selected_cell});
            this.selected_cell = null;
        }
    }

    on_left_click(event)
    {
        event.preventDefault();
        this.dispatchEvent({
            type: 'left_click', cell: this.selected_cell});
        this.on_mouse_move(event);
    }

    on_right_click(event)
    {
        event.preventDefault();
        this.dispatchEvent({
            type: 'right_click', cell: this.selected_cell});
        this.on_mouse_move(event);
    }
}