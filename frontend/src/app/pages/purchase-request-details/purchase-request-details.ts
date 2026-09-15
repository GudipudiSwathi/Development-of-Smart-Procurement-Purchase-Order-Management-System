import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  PurchaseRequest,
  PurchaseRequestService,
  Product
} from '../../services/purchase-request';

import { finalize } from 'rxjs';


@Component({
  selector: 'app-purchase-request-details',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './purchase-request-details.html',

  styleUrl: './purchase-request-details.css'
})
export class PurchaseRequestDetailsPage implements OnInit {


  // =====================================================
  // DATA
  // =====================================================

  request: PurchaseRequest | null = null;

  products: Product[] = [];


  // =====================================================
  // UI STATE
  // =====================================================

  isLoading = false;

  isLoadingProducts = false;

  errorMessage = '';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private purchaseRequestService: PurchaseRequestService,
    private cdr: ChangeDetectorRef
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.loadRequest();

    this.loadProducts();

  }


  // =====================================================
  // LOAD REQUEST
  // =====================================================

  loadRequest(): void {

    this.isLoading = true;

    this.errorMessage = '';

    const requestId =
      Number(
        this.route.snapshot.paramMap.get('id')
      );


    console.log(
      'REQUEST DETAILS ID:',
      requestId
    );


    if (!requestId) {

      this.errorMessage =
        'Invalid purchase request ID.';

      this.isLoading = false;

      return;
    }


    this.purchaseRequestService
      .getPurchaseRequestById(requestId)

      .pipe(
        finalize(() => {

          this.isLoading = false;

          this.cdr.detectChanges();

        })
      )

      .subscribe({

        next: (request) => {

          console.log(
            'PURCHASE REQUEST DETAILS:',
            request
          );

          this.request = request;

        },


        error: (error) => {

          console.error(
            'FAILED TO LOAD REQUEST DETAILS:',
            error
          );


          this.request = null;


          if (error.status === 401) {

            this.errorMessage =
              'Your session has expired. Please login again.';

          }

          else if (error.status === 403) {

            this.errorMessage =
              'You do not have permission to view this request.';

          }

          else if (error.status === 404) {

            this.errorMessage =
              'Purchase request not found.';

          }

          else {

            this.errorMessage =
              'Unable to load purchase request details.';

          }

        }

      });

  }


  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

  loadProducts(): void {

    this.isLoadingProducts = true;


    this.purchaseRequestService
      .getAllProducts()

      .subscribe({

        next: (products) => {

          console.log(
            'DETAIL PAGE PRODUCTS RECEIVED:',
            products
          );


          this.products =
            Array.isArray(products)
              ? products
              : [];


          console.log(
            'DETAIL PAGE PRODUCTS STORED:',
            this.products
          );


          this.isLoadingProducts = false;

          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'FAILED TO LOAD PRODUCTS:',
            error
          );

          this.products = [];

          this.isLoadingProducts = false;

          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // GET PRODUCT
  // =====================================================

  getProduct(
    productId: number
  ): Product | undefined {

    if (!this.products.length) {

      return undefined;

    }


    return this.products.find(
      product =>
        Number(product.productId) ===
        Number(productId)
    );

  }


  // =====================================================
  // GET PRODUCT NAME
  // =====================================================

  getProductName(
    productId: number
  ): string {

    const product =
      this.getProduct(productId);


    if (product?.name) {

      return product.name;

    }


    return `Product #${productId}`;

  }


  // =====================================================
  // GET PRODUCT PRICE
  // =====================================================

  getProductPrice(
    productId: number
  ): number {

    const product =
      this.getProduct(productId);


    if (!product) {

      console.warn(
        `Product ${productId} was not found in product list.`
      );

      return 0;

    }


    const price =
      Number(product.price);


    return Number.isFinite(price)
      ? price
      : 0;

  }


  // =====================================================
  // GET ITEM TOTAL
  // =====================================================

  getItemTotal(
    productId: number,
    quantity: number
  ): number {

    const price =
      this.getProductPrice(productId);

    const qty =
      Number(quantity);


    if (
      !Number.isFinite(price) ||
      !Number.isFinite(qty)
    ) {

      return 0;

    }


    return price * qty;

  }


  // =====================================================
  // GET TOTAL PRICE
  // =====================================================

  getTotalPrice(): number {

    /*
     * IMPORTANT:
     *
     * The backend already provides the actual
     * purchase request total.
     *
     * Always prefer that value.
     */

    if (
      this.request &&
      this.request.totalPrice != null &&
      Number.isFinite(
        Number(this.request.totalPrice)
      )
    ) {

      return Number(
        this.request.totalPrice
      );

    }


    /*
     * Fallback calculation only when the backend
     * did not provide totalPrice.
     */

    if (!this.request?.items) {

      return 0;

    }


    return this.request.items.reduce(
      (total, item) => {

        return total +
          this.getItemTotal(
            item.productId,
            item.quantity
          );

      },
      0
    );

  }


  // =====================================================
  // CHECK WHETHER PRODUCT PRICE IS AVAILABLE
  // =====================================================

  hasProductPrice(
    productId: number
  ): boolean {

    const product =
      this.getProduct(productId);


    if (!product) {

      return false;

    }


    const price =
      Number(product.price);


    return Number.isFinite(price);

  }


  // =====================================================
  // STATUS CLASS
  // =====================================================

  getStatusClass(): string {

    const status =
      this.request?.status?.toUpperCase();


    if (status === 'APPROVED') {

      return 'approved';

    }


    if (status === 'REJECTED') {

      return 'rejected';

    }


    return 'pending';

  }


  // =====================================================
  // BACK TO REQUESTS
  // =====================================================

  goBack(): void {

    this.router.navigate([
      '/purchase-requests'
    ]);

  }

}
