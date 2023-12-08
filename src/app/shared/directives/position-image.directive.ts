import { Directive, ElementRef, Renderer2, OnInit, Input } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';

@Directive({
  selector: '[positionImage]'
})
export class PositionImageDirective implements OnInit {
  private position="";
  @Input() set positionName(pos:string){
    this.position=pos
  }

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private api: ApiService
  ) {}

  ngOnInit() {
    // Seleccionar un nombre de imagen aleatorio de la matriz
    let randomImageId = this.getPositionId(this.position);

    // Realizar una llamada HTTP para obtener la imagen aleatoria
    this.api.get(`/upload/files/${randomImageId}`).subscribe(result => {
      let randomUrl = result?.formats?.thumbnail?.url || 'https://res.cloudinary.com/dxvp0tyf0/image/upload/v1701952633/small_unknown_ec725c380f.png';
      this.applyBackgroundImage(randomUrl);
    });
  }

  private applyBackgroundImage(url: string): void {
    // Aplicar la URL de imagen al fondo del elemento
    this.renderer.setStyle(this.el.nativeElement, 'background-image', `url(${url})`);
    this.renderer.setStyle(this.el.nativeElement, 'background-size', 'cover');
    this.renderer.setStyle(this.el.nativeElement, 'background-repeat', 'no-repeat');
    this.renderer.setStyle(this.el.nativeElement, 'width', '70px');
    this.renderer.setStyle(this.el.nativeElement, 'height', '70px');
    this.renderer.setStyle(this.el.nativeElement, 'border-radius', '50%');
    this.renderer.setStyle(this.el.nativeElement.firstChild, 'border-radius', '50%');
  }
  

  private getPositionId(positionName:string|undefined):number{
    switch (positionName) {
      case "pitcher":
        return 6
        break;
        case "catcher":
          return 2
        break;
        case "first base":
          return 5
        break;
        case "second base":
          return 10
        break;
        case "shortstop":
          return 9
        break;
        case "third base":
          return 7
        break;
        case "left field":
          return 3
        break;
        case "right field":
          return 8
        break;
        case "center field":
          return 4
        break;
      default:
        return 11
        break;
    }
  }
  }

