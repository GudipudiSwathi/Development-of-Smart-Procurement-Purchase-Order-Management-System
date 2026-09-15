import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import { finalize } from 'rxjs';

import {
  AuthService
} from '../../services/auth';

import {
  Product,
  PurchaseRequest,
  PurchaseRequestService
} from '../../services/purchase-request';


@Component({
  selector: 'app-purchase-request',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule
  ],

  templateUrl: './purchase-request.html',
  styleUrl: './purchase-request.css'
})
export class PurchaseRequestPage implements OnInit {


  // =====================================================
  // DATA
  // =====================================================

  purchaseRequests: PurchaseRequest[] = [];

  products: Product[] = [];


  // =====================================================
  // UI STATE
  // =====================================================

  isLoading = false;

  isLoadingProducts = false;

  isSubmitting = false;

  errorMessage = '';

  successMessage = '';

  showCreateForm = false;


  // =====================================================
  // CREATE REQUEST FORM
  // =====================================================

  createRequestForm: FormGroup;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private purchaseRequestService: PurchaseRequestService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {

    this.createRequestForm =
      this.fb.group({

        remarks: [
          ''
        ],

        items: this.fb.array([
          this.createItemForm()
        ])

      });

  }


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.loadPurchaseRequests();

    this.loadProducts();

  }


  // =====================================================
  // OPEN REQUEST DETAILS
  // =====================================================

  openRequestDetails(
    requestId: number | undefined
  ): void {

    if (!requestId) {

      console.error(
        'INVALID PURCHASE REQUEST ID:',
        requestId
      );

      return;

    }


    console.log(
      'OPENING PURCHASE REQUEST DETAILS:',
      requestId
    );


    this.router.navigate([
      '/purchase-request-details',
      requestId
    ])
      .then((success) => {

        console.log(
          'NAVIGATION RESULT:',
          success
        );

      })
      .catch((error) => {

        console.error(
          'NAVIGATION FAILED:',
          error
        );

      });

  }


  // =====================================================
  // ITEMS FORM ARRAY
  // =====================================================

  get items(): FormArray {

    return this.createRequestForm
      .get('items') as FormArray;

  }


  // =====================================================
  // CREATE PRODUCT ITEM
  // =====================================================

  createItemForm(): FormGroup {

    return this.fb.group({

      productId: [
        '',
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      quantity: [
        1,
        [
          Validators.required,
          Validators.min(1)
        ]
      ]

    });

  }


  // =====================================================
  // ADD PRODUCT
  // =====================================================

  addItem(): void {

    this.items.push(
      this.createItemForm()
    );

  }


  // =====================================================
  // REMOVE PRODUCT
  // =====================================================

  removeItem(index: number): void {

    if (this.items.length <= 1) {

      return;

    }

    this.items.removeAt(index);

  }


  // =====================================================
  // OPEN CREATE FORM
  // =====================================================

  openCreateForm(): void {

    console.log('CREATE REQUEST BUTTON CLICKED');

    this.showCreateForm = true;

    this.successMessage = '';
    this.errorMessage = '';

    // Only load again if products are not already available.
    if (this.products.length === 0) {
      this.loadProducts();
    }

  }


  // =====================================================
  // CLOSE CREATE FORM
  // =====================================================

  closeCreateForm(): void {

    console.log(
      'CLOSE CREATE REQUEST FORM'
    );

    this.showCreateForm = false;

  }


  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

  loadProducts(): void {

    console.log('LOADING PRODUCTS...');

    this.isLoadingProducts = true;
    this.errorMessage = '';

    this.purchaseRequestService
      .getAllProducts()
      .pipe(
        finalize(() => {

          console.log(
            'PRODUCT LOADING FINISHED'
          );

          this.isLoadingProducts = false;

          this.cdr.detectChanges();

        })
      )
      .subscribe({

        next: (products) => {

          console.log(
            'PRODUCTS RECEIVED:',
            products
          );

          this.products = products || [];

          console.log(
            'PRODUCTS STORED:',
            this.products
          );

        },

        error: (error) => {

          console.error(
            'FAILED TO LOAD PRODUCTS:',
            error
          );

          this.products = [];

          if (error.status === 401) {

            this.errorMessage =
              'Your session has expired. Please login again.';

          }
          else if (error.status === 403) {

            this.errorMessage =
              'You do not have permission to view products.';

          }
          else if (error.status === 404) {

            this.errorMessage =
              'Product service was not found. Please check the backend.';

          }
          else {

            this.errorMessage =
              'Unable to load products. Please try again.';

          }

        }

      });

  }

  // =====================================================
  // GET PRODUCT
  // =====================================================

  getProduct(
    productId: number
  ): Product | undefined {

    return this.products.find(
      p =>
        Number(p.productId) ===
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

    return product
      ? product.name
      : `Product #${productId}`;

  }


  // =====================================================
  // GET PRODUCT PRICE
  // =====================================================

  getProductPrice(
    productId: number
  ): number {

    const product =
      this.getProduct(productId);

    return Number(
      product?.price ?? 0
    );

  }


  // =====================================================
  // GET AVAILABLE QUANTITY
  // =====================================================

  getAvailableQuantity(
    productId: number
  ): number {

    const product =
      this.getProduct(productId);

    return product?.numberOfQuantities ?? 0;

  }


  // =====================================================
  // GET ITEM TOTAL
  // =====================================================

  getItemTotal(
    index: number
  ): number {

    const item =
      this.items.at(index);

    if (!item) {

      return 0;

    }

    const productId =
      Number(
        item.get('productId')?.value
      );

    const quantity =
      Number(
        item.get('quantity')?.value
      );

    if (
      !productId ||
      !quantity ||
      quantity < 1
    ) {

      return 0;

    }

    const price =
      this.getProductPrice(productId);

    return price * quantity;

  }


  // =====================================================
  // GET TOTAL REQUEST PRICE
  // =====================================================

  getTotalPrice(): number {

    let total = 0;

    for (
      let i = 0;
      i < this.items.length;
      i++
    ) {

      total += this.getItemTotal(i);

    }

    return total;

  }


  // =====================================================
  // LOAD MY PURCHASE REQUESTS
  // =====================================================

  loadPurchaseRequests(): void {

    console.log(
      'LOADING MY PURCHASE REQUESTS...'
    );

    this.isLoading = true;

    this.errorMessage = '';

    const userId =
      this.authService.getUserId();

    console.log(
      'LOGGED-IN USER ID:',
      userId
    );


    if (!userId) {

      this.purchaseRequests = [];

      this.isLoading = false;

      this.errorMessage =
        'Unable to identify the logged-in user. Please login again.';

      this.cdr.detectChanges();

      return;

    }


    this.purchaseRequestService
      .getAllPurchaseRequests()

      .pipe(
        finalize(() => {

          console.log(
            'MY PURCHASE REQUEST LOADING FINISHED'
          );

          this.isLoading = false;

          this.cdr.detectChanges();

        })
      )

      .subscribe({

        next: (requests) => {

          console.log(
            'ALL PURCHASE REQUESTS RECEIVED:',
            requests
          );

          // Filter to the logged-in employee first, then
          // sort by Purchase Request ID descending.
          // New requests receive the next/higher ID, so the
          // most recently raised request always appears first.
          this.purchaseRequests =
            (Array.isArray(requests)
                ? requests
                : []
            )
              .filter(
                request =>
                  Number(request.userId) ===
                  Number(userId)
              )
              .sort(
                (first, second) =>
                  Number(second.purchaseRequestId) -
                  Number(first.purchaseRequestId)
              );

          console.log(
            'FILTERED MY PURCHASE REQUESTS:',
            this.purchaseRequests
          );

        },


        error: (error) => {

          console.error(
            'FAILED TO LOAD PURCHASE REQUESTS:',
            error
          );

          this.purchaseRequests = [];


          if (error.status === 401) {

            this.errorMessage =
              'Your session has expired. Please login again.';

          }

          else if (error.status === 403) {

            this.errorMessage =
              'You do not have permission to view purchase requests.';

          }

          else {

            this.errorMessage =
              'Unable to load your purchase requests.';

          }

          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // RESET FORM
  // =====================================================

  resetCreateForm(): void {

    this.createRequestForm.reset();

    this.items.clear();

    this.items.push(
      this.createItemForm()
    );

  }


  // =====================================================
  // SUBMIT PURCHASE REQUEST
  // =====================================================

  submitPurchaseRequest(): void {

    console.log(
      'SUBMIT PURCHASE REQUEST CLICKED'
    );


    // ===================================================
    // VALIDATE FORM
    // ===================================================

    if (this.createRequestForm.invalid) {

      console.log(
        'CREATE REQUEST FORM IS INVALID'
      );

      this.createRequestForm.markAllAsTouched();

      this.errorMessage =
        'Please enter valid product and quantity details.';

      return;

    }


    // ===================================================
    // GET LOGGED-IN USER
    // ===================================================

    const userId =
      this.authService.getUserId();


    if (!userId) {

      this.errorMessage =
        'Unable to identify the logged-in user. Please login again.';

      return;

    }


    // ===================================================
    // PREPARE ITEMS
    // ===================================================

    const formItems =
      this.createRequestForm.value.items;


    const items =
      formItems.map(
        (item: any) => ({

          productId:
            Number(item.productId),

          quantity:
            Number(item.quantity)

        })
      );


    // ===================================================
    // VALIDATE PRODUCT QUANTITIES
    // ===================================================

    for (const item of items) {

      const availableQuantity =
        this.getAvailableQuantity(
          item.productId
        );


      if (
        availableQuantity > 0 &&
        item.quantity > availableQuantity
      ) {

        this.errorMessage =
          `Requested quantity for ${this.getProductName(item.productId)} ` +
          `cannot exceed available quantity (${availableQuantity}).`;

        return;

      }

    }


    // ===================================================
    // CREATE REQUEST OBJECT
    // ===================================================

    const request: PurchaseRequest = {

      userId: userId,

      totalPrice:
        this.getTotalPrice(),

      remarks:
      this.createRequestForm.value.remarks,

      items: items

    };


    console.log(
      'SENDING PURCHASE REQUEST:',
      request
    );


    // ===================================================
    // SUBMIT
    // ===================================================

    // Prevent duplicate submissions while the current request is running.
    if (this.isSubmitting) {

      console.log(
        'PURCHASE REQUEST SUBMISSION ALREADY IN PROGRESS'
      );

      return;
    }


    this.isSubmitting = true;

    this.successMessage = '';

    this.errorMessage = '';

    this.cdr.detectChanges();


    this.purchaseRequestService
      .createPurchaseRequest(request)
      .pipe(
        finalize(() => {

          // This ALWAYS runs when the HTTP request completes,
          // succeeds, or fails, so the button cannot remain
          // stuck on "Submitting...".
          this.isSubmitting = false;

          this.cdr.detectChanges();

          console.log(
            'PURCHASE REQUEST SUBMISSION FINISHED'
          );

        })
      )
      .subscribe({

        next: (response) => {

          console.log(
            'PURCHASE REQUEST CREATED:',
            response
          );

          this.successMessage =
            'Purchase request created successfully!';

          this.showCreateForm = false;

          this.resetCreateForm();

          // Refresh the request list so the newly created
          // request appears immediately.
          this.loadPurchaseRequests();

          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'FAILED TO CREATE PURCHASE REQUEST:',
            error
          );

          if (error?.status === 400) {

            this.errorMessage =
              this.getPurchaseRequestErrorMessage(
                error,
                'Invalid purchase request. Please check your products and quantities.'
              );

          }

          else if (error?.status === 401) {

            this.errorMessage =
              'Your session has expired. Please login again.';

          }

          else if (error?.status === 403) {

            this.errorMessage =
              'You do not have permission to create a purchase request.';

          }

          else if (error?.status === 404) {

            this.errorMessage =
              'Purchase request service was not found. Please check the backend.';

          }

          else if (error?.status >= 500) {

            this.errorMessage =
              'Server error while creating the purchase request. Please try again.';

          }

          else if (error?.name === 'TimeoutError') {

            this.errorMessage =
              'The server took too long to respond. Please check the backend.';

          }

          else {

            this.errorMessage =
              this.getPurchaseRequestErrorMessage(
                error,
                'Unable to create purchase request. Please try again.'
              );

          }

          this.cdr.detectChanges();

        }

      });

  }

  // =====================================================
  // PURCHASE REQUEST ERROR MESSAGE
  // =====================================================

  private getPurchaseRequestErrorMessage(
    error: any,
    fallback: string
  ): string {

    const body = error?.error;

    if (typeof body === 'string' && body.trim()) {
      return body.trim();
    }

    if (body?.message) {
      return String(body.message);
    }

    if (body?.error) {
      return String(body.error);
    }

    if (body?.detail) {
      return String(body.detail);
    }

    return fallback;
  }


}
