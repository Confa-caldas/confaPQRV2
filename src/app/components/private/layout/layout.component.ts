import { Component, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { SessionStorageItems } from '../../../enums/session-storage-items.enum';
import { Router } from '@angular/router';
import { Users } from '../../../services/users.service';
import { formatDate } from '@angular/common';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { RequestsList, FilterRequests } from '../../../models/users.interface';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent implements OnInit {
  nodes!: TreeNode[];
  expand!: boolean;
  user: string = '';
  mostrarNotificaciones = false;
  requestListByAssigned: RequestsList[] = [];
  statusOptions!: string[];
  daysOption!: number[];
  totalRowsAssigned: number = 0;

  solicitudesPendientes = [
    { nombre: 'Solicitud 1', fechaVencimiento: '2024-02-15' },
    { nombre: 'Solicitud 2', fechaVencimiento: '2024-02-16' },
    { nombre: 'Solicitud 3', fechaVencimiento: '2024-02-17' }
  ];

  constructor(
    private router: Router,
    private userService: Users,) {}

  ngOnInit() {
    const arrayAlmacenado = sessionStorage.getItem(SessionStorageItems.MENU);
    console.log(sessionStorage.getItem(SessionStorageItems.USER));
    this.user = sessionStorage.getItem(SessionStorageItems.USER) || '';
    this.nodes = arrayAlmacenado ? JSON.parse(arrayAlmacenado.replaceAll('_', '-')) : [];

    this.loadNotification(this.user);
  }

  

  onNodeSelect(event: any): void {
    console.log('Nodo seleccionado:', event.node);
    console.log('Estado de expansión:', event.node.expanded);
  }

  nodeExpand(event: any) {
    console.log('Nodo seleccionado:', event.node);
  }

  nodeCollapse(event: any) {
    console.log('Nodo seleccionado:', event.node);
  }

  nodeSelect(event: any) {
    console.log('Nodo seleccionado:', event.node);
  }

  nodeUnselect(event: any) {
    console.log('Nodo seleccionado:', event.node);
  }

  toggleNavBar() {
    this.expand = !this.expand;
  }

  logout(): void {
    // Eliminar información de autenticación (por ejemplo, token)
    this.clearAuthenticationData();

    // Redirigir a la página de inicio de sesión
    this.router.navigate(['/login']);
  }

  // Método para limpiar la información de autenticación
  private clearAuthenticationData(): void {
    // Eliminar token u otra información de autenticación del almacenamiento local
    sessionStorage.clear();
  }
  redirect(url: string) {
    this.router.navigate([url]);
  }

  toggleNotificaciones() {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
  }

  loadNotification(user: string) {
    const payload: FilterRequests = {
          i_date: null,
          f_date: null,
          filing_number: null,
          doc_id: null,
          applicant_name: null,
          request_days: null,
          applicant_type_id: null,
          request_type_id: null,
          status_id: [2, 3, 5, 6, 7],
          priority_level: null,
          confa_user: null,
          area_name: null,
          page: 1,
          page_size: 100
        };
        this.getRequestListByAssignedUserByFilter(payload);
  }

  getRequestListByAssignedUserByFilter(payload: FilterRequests) {
    this.userService.getRequestListByAssignedUser(this.user, payload).subscribe({
      next: (response: BodyResponse<RequestsList[]>) => {
        if (response.code === 200) {
          this.requestListByAssigned = response.data;
          this.daysOption = Array.from(
            new Set(this.requestListByAssigned.map(item => item.request_days))
          );
          this.statusOptions = Array.from(
            new Set(this.requestListByAssigned.map(item => item.status_name))
          );
          this.requestListByAssigned = response.data.map(item => {
            const transformedDate = formatDate(item.filing_date, 'MM/dd/yyyy', 'en-US');
            return { ...item, filing_date: transformedDate };
          });
          this.requestListByAssigned.forEach(item => {
            if (typeof item.filing_date === 'string') {
              item.filing_date_date = new Date(item.filing_date);
            }
          });
          this.totalRowsAssigned = Number(response.message);
        } else {
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        console.log('La suscripción ha sido completada.');
      },
    });
  }
  
}

